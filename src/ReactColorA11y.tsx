import * as React from 'react'
import { colord, extend as extendColord, type Colord } from 'colord'
import colordNamesPlugin from 'colord/plugins/names'
import colordA11yPlugin from 'colord/plugins/a11y'
import colordMixPlugin from 'colord/plugins/mix'

extendColord([colordNamesPlugin, colordA11yPlugin, colordMixPlugin])

type TargetLuminance = { min: number, max?: never } | { min?: never, max: number };

// Track our CSS inline overrides so we can clear them before re-reading.
// When we set element.style[prop], it has higher specificity than class-based
// styles (e.g. MUI sx) and hides subsequent class changes. The two-phase
// approach clears overrides first, reads true computed values, then re-applies.
type CssOverrideEntry = { originalInline: string, adjusted: string }
type CssOverrides = { color?: CssOverrideEntry, fill?: CssOverrideEntry, stroke?: CssOverrideEntry }

// Track original SVG attribute values. React won't re-apply unchanged attrs,
// so once we overwrite an attribute we need to remember the original.
type AttrColorEntry = { original: string, enforced: string }
type AttrColors = { fill?: AttrColorEntry, stroke?: AttrColorEntry, stopColor?: AttrColorEntry }

enum LuminanceChangeDirection {
  Lighten,
  Darken
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

const CHILD_OBSERVER_OPTIONS: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'fill', 'stroke', 'stop-color', 'color', 'class']
}

const ANCESTOR_OBSERVER_OPTIONS: MutationObserverInit = {
  attributes: true,
  attributeFilter: ['style', 'class']
}

const colorsMatch = (a: string, b: string): boolean => {
  if (a === b) return true
  const ca = colord(a)
  const cb = colord(b)
  return ca.isValid() && cb.isValid() && ca.toHex() === cb.toHex()
}

const resolveOriginal = (
  currentValue: string,
  entry: AttrColorEntry | undefined
): string => {
  if (!entry) return currentValue
  if (!colorsMatch(currentValue, entry.enforced)) return currentValue
  return entry.original
}

const getBackgroundColordStack = (element: Element) => {
  const stack = []
  let currentElement = element

  while (currentElement.parentElement) {
    const { backgroundColor } = getComputedStyle(currentElement)

    if (backgroundColor) {
      const currentBackgroundColord = colord(backgroundColor)
      stack.push(currentBackgroundColord)

      if (currentBackgroundColord.alpha() === 1) {
        break
      }
    }

    currentElement = currentElement.parentElement
  }

  return stack
}

const blendLayeredColors = (colors: Colord[]) => {
  if (!colors.length) {
    return null
  }

  let mixedColord = colors.pop()!
  let nextColord = colors.pop()
  while (nextColord) {
    const ratio = nextColord.alpha()
    if (ratio > 0) {
      mixedColord = mixedColord.mix(nextColord.alpha(1), ratio)
    }
    nextColord = colors.pop()
  }

  return mixedColord
}

const getEffectiveBackgroundColor = (element: Element): Colord | null => {
  return blendLayeredColors(getBackgroundColordStack(element))
}

const shiftBrightnessUntilTargetLuminance = (originalColord: Colord, targetLuminance: TargetLuminance): Colord => {
  let newColord = originalColord

  let iteration = 0
  const maxIterations = 100
  const tolerance = 0.02
  let deltaLuminance = Number.POSITIVE_INFINITY
  const target = targetLuminance.min ?? targetLuminance.max

  while (Math.abs(deltaLuminance) > tolerance) {
    iteration += 1
    deltaLuminance = target - newColord.luminance()
    if (iteration > maxIterations) {
      console.warn('Reached maximum iterations while adjusting color luminance!')
      break
    }
    if (deltaLuminance > 0) {
      newColord = newColord.lighten(deltaLuminance / 2)
    } else {
      newColord = newColord.darken(Math.abs(deltaLuminance) / 2)
    }
  }

  return newColord
}

type ChildWithRef = React.ReactElement<any, string | React.JSXElementConstructor<any>> & {
  ref?: React.Ref<HTMLElement>;
};

export interface ReactColorA11yProps {
  children: ChildWithRef | React.ReactNode
  requiredContrastRatio?: number
  flipBlackAndWhite?: boolean
  preserveContrastDirectionIfPossible?: boolean
  backgroundColorOverride?: string
}

const ReactColorA11y: React.FunctionComponent<ReactColorA11yProps> = ({
  children,
  requiredContrastRatio = 4.5,
  flipBlackAndWhite = false,
  preserveContrastDirectionIfPossible = true,
  backgroundColorOverride
}: ReactColorA11yProps): React.JSX.Element => {
  const internalRef = React.useRef<HTMLElement>(null);
  const childRef = (React.isValidElement(children) && 'ref' in children.props && children.props.ref)
    ? children.props.ref as React.RefObject<HTMLElement> : null
  const reactColorA11yRef = childRef ?? internalRef as React.RefObject<HTMLElement>;

  const cssOverridesRef = React.useRef(new WeakMap<HTMLElement, CssOverrides>());
  const attrColorsRef = React.useRef(new WeakMap<HTMLElement, AttrColors>());
  const observerRef = React.useRef<MutationObserver | null>(null);
  const enforceRef = React.useRef<(node: Node | null) => void>(() => { });

  const calculateA11yColor = (backgroundColord: Colord, originalColor: string): string => {
    const originalColord = colord(originalColor)

    if (!originalColord.isValid()) {
      return originalColor
    }

    if (backgroundColord.contrast(originalColord) >= requiredContrastRatio) {
      return originalColor
    }

    const backgroundColorLuminance = backgroundColord.luminance()
    const originalColorLuminance = originalColord.luminance()

    // This number represents the intersection of dark and light background contrast ratio curves
    // https://www.w3.org/TR/WCAG20/#contrast-ratiodef
    // (1 + 0.05) / (x + 0.05) = (x + 0.05) / (0 + 0.05)
    const luminanceDirectionThreshold = 0.179129

    let direction = backgroundColorLuminance < luminanceDirectionThreshold
      ? LuminanceChangeDirection.Lighten
      : LuminanceChangeDirection.Darken

    if (preserveContrastDirectionIfPossible) {
      if (originalColorLuminance < backgroundColorLuminance) {
        if (backgroundColord.contrast(colord('#000000')) >= requiredContrastRatio) {
          direction = LuminanceChangeDirection.Darken
        }
      } else if (backgroundColord.contrast(colord('#ffffff')) >= requiredContrastRatio) {
        direction = LuminanceChangeDirection.Lighten
      }
    }

    const targetLuminance = getTargetLuminance(backgroundColorLuminance, direction)

    if (flipBlackAndWhite) {
      if (targetLuminance.min !== undefined && originalColord.brightness() === 0) {
        return '#ffffff'
      }

      if (targetLuminance.max !== undefined && originalColord.brightness() === 1) {
        return '#000000'
      }
    }

    const newColord = shiftBrightnessUntilTargetLuminance(originalColord, targetLuminance)

    return newColord.toHex()
  }

  // Found from solving for L2 given L1 and contrast ratio: https://www.w3.org/TR/WCAG20/#contrast-ratiodef
  const getTargetLuminance = (backgroundColorLuminance: number, direction: LuminanceChangeDirection): TargetLuminance => {
    const luminanceOffset = 0.05

    return (direction === LuminanceChangeDirection.Lighten
      ? { min: clamp(requiredContrastRatio * (backgroundColorLuminance + luminanceOffset) - luminanceOffset, 0, 1) }
      : { max: clamp((backgroundColorLuminance + luminanceOffset) / requiredContrastRatio - luminanceOffset, 0, 1) }
    )
  }

  const ensureAttrColors = (element: HTMLElement): AttrColors => {
    const map = attrColorsRef.current
    if (!map.has(element)) map.set(element, {})
    return map.get(element)!
  }

  // Phase 1: Clear our CSS inline overrides, restoring original inline values
  // so getComputedStyle returns the true (class/inherited/user-set) values.
  // This runs over the entire tree BEFORE Phase 2 to avoid inheritance pollution
  // (parent override leaking into child's getComputedStyle).
  const clearCssOverrides = (node: Node | null): void => {
    const element = node as HTMLElement
    if (element?.style !== undefined) {
      const overrides = cssOverridesRef.current.get(element)
      if (overrides) {
        for (const prop of ['color', 'fill', 'stroke'] as const) {
          const entry = overrides[prop]
          if (entry) {
            if (colorsMatch(element.style[prop], entry.adjusted)) {
              // Our override is still in place — restore what was there before
              element.style[prop] = entry.originalInline
            }
            // else: something external changed the inline — leave it
          }
        }
        cssOverridesRef.current.delete(element)
      }
    }
    node?.childNodes?.forEach(child => clearCssOverrides(child))
  }

  const enforceColorsOnElement = (element: HTMLElement | null): void => {
    if (element?.getAttribute === undefined || element.dataset.ignoreColorA11y !== undefined) {
      return
    }

    const backgroundColord = backgroundColorOverride
      ? colord(backgroundColorOverride)
      : getEffectiveBackgroundColor(element)

    if (backgroundColord === null) {
      return
    }

    // --- SVG attributes ---
    const attrColors = ensureAttrColors(element)

    const enforceAttr = (attr: string, key: keyof AttrColors) => {
      const value = element.getAttribute(attr)
      if (value === null) return
      const original = resolveOriginal(value, attrColors[key])
      const adjusted = calculateA11yColor(backgroundColord, original)
      attrColors[key] = { original, enforced: adjusted }
      if (value !== adjusted) element.setAttribute(attr, adjusted)
    }

    enforceAttr('fill', 'fill')
    enforceAttr('stroke', 'stroke')
    enforceAttr('stop-color', 'stopColor')

    // --- CSS properties ---
    // Phase 1 has already cleared our previous inline overrides, so
    // getComputedStyle now reflects the true natural values
    if (element.style !== undefined) {
      const overrides: CssOverrides = {}

      for (const prop of ['color', 'fill', 'stroke'] as const) {
        const computedValue = getComputedStyle(element)[prop]
        if (!computedValue) continue

        const adjusted = calculateA11yColor(backgroundColord, computedValue)
        if (computedValue !== adjusted) {
          overrides[prop] = { originalInline: element.style[prop], adjusted }
          element.style[prop] = adjusted
        }
      }

      if (overrides.color || overrides.fill || overrides.stroke) {
        cssOverridesRef.current.set(element, overrides)
      }
    }
  }

  // Phase 2: Walk the tree and enforce colors on each element
  const applyColorsRecursively = (node: Node | null): void => {
    enforceColorsOnElement(node as HTMLElement)
    node?.childNodes?.forEach(childNode => applyColorsRecursively(childNode))
  }

  const enforceColorsRecursively = (node: Node | null): void => {
    // Phase 1: Clear our CSS inline overrides so getComputedStyle shows true values
    clearCssOverrides(node)
    // Phase 2: Read computed styles and apply new overrides where needed
    applyColorsRecursively(node)
  }

  // Keep a stable ref to the latest enforcement function so MutationObserver
  // callbacks always use current prop values without needing to re-subscribe.
  enforceRef.current = enforceColorsRecursively

  // useLayoutEffect runs synchronously after React's DOM commit but before paint,
  // ensuring we pick up React-driven style/attribute changes immediately.
  React.useLayoutEffect(() => {
    const element = reactColorA11yRef.current
    if (!element) return

    // Disconnect observer while we enforce to prevent cascading mutations
    observerRef.current?.disconnect()
    enforceColorsRecursively(element)

    // Reconnect if the observer was already set up
    if (observerRef.current) {
      observerRef.current.observe(element, CHILD_OBSERVER_OPTIONS)
    }
  })

  React.useEffect(() => {
    if (!reactColorA11yRef.current) return

    const element = reactColorA11yRef.current

    const mutationCallback = (): void => {
      observer.disconnect()
      enforceRef.current(element)
      observer.observe(element, CHILD_OBSERVER_OPTIONS)
    }

    const observer = new MutationObserver(mutationCallback)
    observerRef.current = observer

    observer.observe(element, CHILD_OBSERVER_OPTIONS)

    // Also observe ancestors for style/class changes (e.g. background color switching)
    const ancestorObserver = new MutationObserver(mutationCallback)
    let ancestor = element.parentElement
    while (ancestor) {
      ancestorObserver.observe(ancestor, ANCESTOR_OBSERVER_OPTIONS)
      ancestor = ancestor.parentElement
    }

    return () => {
      observer.disconnect()
      ancestorObserver.disconnect()
      observerRef.current = null
    }
  }, [reactColorA11yRef.current])

  if (!Array.isArray(children) && React.isValidElement<{ ref: React.RefObject<HTMLElement> }>(children)) {
    return React.cloneElement(children, {
      ref: reactColorA11yRef
    })
  }

  return (
    <div ref={reactColorA11yRef as React.RefObject<HTMLDivElement>}>
      {children}
    </div>
  )
}

export default ReactColorA11y
