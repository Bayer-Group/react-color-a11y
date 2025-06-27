import * as React from 'react'
import { colord, extend as extendColord, type Colord } from 'colord'
import colordNamesPlugin from 'colord/plugins/names'
import colordA11yPlugin from 'colord/plugins/a11y'
import colordMixPlugin from 'colord/plugins/mix'

extendColord([colordNamesPlugin, colordA11yPlugin, colordMixPlugin])

interface TargetLuminance {
  min?: number
  max?: number
}

enum LuminanceChangeDirection {
  Lighten,
  Darken
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

  const increment = 0.01

  if (targetLuminance.min !== undefined) {
    while (newColord.luminance() < targetLuminance.min && newColord.brightness() < 0.99) {
      newColord = newColord.lighten(increment)
    }
  } else if (targetLuminance.max !== undefined) {
    while (newColord.luminance() > targetLuminance.max && newColord.brightness() > 0.01) {
      newColord = newColord.darken(increment)
    }
  }

  return newColord
}

export interface ReactColorA11yProps {
  children: React.ReactNode & { ref?: React.RefObject<null> } | undefined
  colorPaletteKey?: string
  requiredContrastRatio?: number
  flipBlackAndWhite?: boolean
  preserveContrastDirectionIfPossible?: boolean
  backgroundColorOverride?: string
}

const ReactColorA11y: React.FunctionComponent<ReactColorA11yProps> = ({
  children,
  colorPaletteKey = 'default',
  requiredContrastRatio = 4.5,
  flipBlackAndWhite = false,
  preserveContrastDirectionIfPossible = true,
  backgroundColorOverride
}: ReactColorA11yProps): React.JSX.Element => {
  const internalRef = React.useRef(null)
  const reactColorA11yRef = children?.ref ?? internalRef

  const calculateA11yColor = (backgroundColord: Colord, originalColor: string): string => {
    const originalColord = colord(originalColor)

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
      } else {
        if (backgroundColord.contrast(colord('#ffffff')) >= requiredContrastRatio) {
          direction = LuminanceChangeDirection.Lighten
        }
      }
    }

    const targetLuminance = getTargetLuminance(backgroundColorLuminance, direction)

    if (!originalColord.isValid()) {
      return originalColor
    }

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
      ? { min: requiredContrastRatio * (backgroundColorLuminance + luminanceOffset) - luminanceOffset }
      : { max: (backgroundColorLuminance + luminanceOffset) / requiredContrastRatio - luminanceOffset }
    )
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

    const fillColor = element.getAttribute('fill')
    if (fillColor !== null) {
      element.setAttribute('fill', calculateA11yColor(backgroundColord, fillColor))
    }

    const strokeColor = element.getAttribute('stroke')
    if (strokeColor !== null) {
      element.setAttribute('stroke', calculateA11yColor(backgroundColord, strokeColor))
    }

    const stopColor = element.getAttribute('stop-color')
    if (stopColor !== null) {
      element.setAttribute('stop-color', calculateA11yColor(backgroundColord, stopColor))
    }

    if (element.style !== undefined) {
      const { color: computedColor, stroke: computedStroke, fill: computedFill } = getComputedStyle(element)
      if (computedColor !== null) {
        element.style.color = calculateA11yColor(backgroundColord, computedColor)
      }
      if (computedFill !== null) {
        element.style.fill = calculateA11yColor(backgroundColord, computedFill)
      }
      if (computedStroke !== null) {
        element.style.stroke = calculateA11yColor(backgroundColord, computedStroke)
      }
    }
  }

  const enforceColorsRecursively = (node: Node | null): void => {
    enforceColorsOnElement(node as HTMLElement)
    node?.childNodes?.forEach((childNode) => {
      enforceColorsRecursively(childNode)
      enforceColorsOnElement(childNode as HTMLElement)
    })
  }

  React.useEffect(() => {
    if (reactColorA11yRef.current === null || reactColorA11yRef.current === undefined) {
      return () => { }
    }

    const mutationCallback = (): void => {
      if (reactColorA11yRef.current !== null && reactColorA11yRef.current !== undefined) {
        enforceColorsRecursively(reactColorA11yRef.current)
      }
    }

    const observer = new MutationObserver(mutationCallback)

    observer.observe(reactColorA11yRef.current, { childList: true, subtree: true })
    mutationCallback()

    return () => {
      observer.disconnect()
    }
  }, [reactColorA11yRef.current, colorPaletteKey, requiredContrastRatio, flipBlackAndWhite])

  if (!Array.isArray(children) && React.isValidElement<{ ref: React.RefObject<null> }>(children)) {
    return React.cloneElement(children, {
      key: colorPaletteKey,
      ref: reactColorA11yRef
    })
  }

  return (
    <div key={colorPaletteKey} ref={reactColorA11yRef}>
      {children}
    </div>
  )
}

export default ReactColorA11y
