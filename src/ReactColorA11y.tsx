import React, { useEffect, useRef, cloneElement, isValidElement } from 'react'
import PropTypes from 'prop-types'
import { colord, extend as extendColord, type Colord } from 'colord'
import colordNamesPlugin from 'colord/plugins/names'
import colordA11yPlugin from 'colord/plugins/a11y'

extendColord([colordNamesPlugin, colordA11yPlugin])

interface TargetLuminence {
  min?: number
  max?: number
}

enum LuminanceChangeDirection {
  Lighten,
  Darken
}

const getEffectiveBackgroundColor = (element: Element): string | null => {
  const backgroundColor = getComputedStyle(element).backgroundColor

  if ((backgroundColor !== 'rgba(0, 0, 0, 0)') && (backgroundColor !== 'transparent')) {
    return backgroundColor
  }

  if (element.nodeName === 'body') {
    return null
  }

  const { parentElement } = element
  if (parentElement !== null) {
    return getEffectiveBackgroundColor(parentElement)
  }

  return backgroundColor
}

const shiftBrightnessUntilTargetLuminence = (originalColord: Colord, targetLuminence: TargetLuminence): Colord => {
  let newColord = originalColord

  const increment = 0.01

  if (targetLuminence.min !== undefined) {
    while (newColord.luminance() < targetLuminence.min && newColord.brightness() < 0.99) {
      newColord = newColord.lighten(increment)
    }
  } else if (targetLuminence.max !== undefined) {
    while (newColord.luminance() > targetLuminence.max && newColord.brightness() > 0.01) {
      newColord = newColord.darken(increment)
    }
  }

  return newColord
}

export interface ReactColorA11yProps {
  children: any
  colorPaletteKey?: string
  requiredContrastRatio?: number
  flipBlackAndWhite?: boolean
  preserveContrastDirectionIfPossible?: boolean
}

const ReactColorA11y: React.FunctionComponent<ReactColorA11yProps> = ({
  children,
  colorPaletteKey = 'default',
  requiredContrastRatio = 4.5,
  flipBlackAndWhite = false,
  preserveContrastDirectionIfPossible = true
}: ReactColorA11yProps): JSX.Element => {
  const reactColorA11yRef = useRef(null)

  const calculateA11yColor = (backgroundColor: string, originalColor: string): string => {
    const backgroundColord = colord(backgroundColor)
    const originalColord = colord(originalColor)

    if (backgroundColord.contrast(originalColord) >= requiredContrastRatio) {
      return originalColor
    }

    const backgroundColorLuminence = backgroundColord.luminance()
    const originalColorLuminance = originalColord.luminance()

    // This number represents the intersection of dark and light background contrast ratio curves
    // https://www.w3.org/TR/WCAG20/#contrast-ratiodef
    // (1 + 0.05) / (x + 0.05) = (x + 0.05) / (0 + 0.05)
    const luminenceDirectionThreshold = 0.179129

    let direction = backgroundColorLuminence < luminenceDirectionThreshold
      ? LuminanceChangeDirection.Lighten
      : LuminanceChangeDirection.Darken

    if (preserveContrastDirectionIfPossible) {
      if (originalColorLuminance < backgroundColorLuminence) {
        if (backgroundColord.contrast(colord('#000000')) >= requiredContrastRatio) {
          direction = LuminanceChangeDirection.Darken
        }
      } else {
        if (backgroundColord.contrast(colord('#ffffff')) >= requiredContrastRatio) {
          direction = LuminanceChangeDirection.Lighten
        }
      }
    }

    const targetLuminence = getTargetLuminence(backgroundColorLuminence, direction)

    if (!originalColord.isValid()) {
      return originalColor
    }

    if (flipBlackAndWhite) {
      if (targetLuminence.min !== undefined && originalColord.brightness() === 0) {
        return '#ffffff'
      }

      if (targetLuminence.max !== undefined && originalColord.brightness() === 1) {
        return '#000000'
      }
    }

    const newColord = shiftBrightnessUntilTargetLuminence(originalColord, targetLuminence)

    return newColord.toHex()
  }

  const getTargetLuminence = (backgroundColorLuminence: number, direction: LuminanceChangeDirection): TargetLuminence => {
    const luminenceOffset = 0.05

    return (direction === LuminanceChangeDirection.Lighten
      ? { min: requiredContrastRatio * (backgroundColorLuminence + luminenceOffset) - luminenceOffset }
      : { max: (backgroundColorLuminence + luminenceOffset) / requiredContrastRatio - luminenceOffset }
    )
  }

  const enforceColorsOnElement = (element: HTMLElement): void => {
    if (element.getAttribute === undefined) {
      return
    }

    const backgroundColor = getEffectiveBackgroundColor(element)

    if (backgroundColor === null) {
      return
    }

    const fillColor = element.getAttribute('fill')
    if (fillColor !== null) {
      element.setAttribute('fill', calculateA11yColor(backgroundColor, fillColor))
    }

    const strokeColor = element.getAttribute('stroke')
    if (strokeColor !== null) {
      element.setAttribute('stroke', calculateA11yColor(backgroundColor, strokeColor))
    }

    const { color: computedColor, stroke: computedStroke, fill: computedFill } = getComputedStyle(element)
    if (computedColor !== null) {
      element.style.color = calculateA11yColor(backgroundColor, computedColor)
    }
    if (computedFill !== null) {
      element.style.fill = calculateA11yColor(backgroundColor, computedFill)
    }
    if (computedStroke !== null) {
      element.style.stroke = calculateA11yColor(backgroundColor, computedStroke)
    }
  }

  const enforceColorsRecursively = (node: Node): void => {
    enforceColorsOnElement(node as HTMLElement)
    node?.childNodes?.forEach((childNode) => {
      enforceColorsRecursively(childNode)
      enforceColorsOnElement(childNode as HTMLElement)
    })
  }

  useEffect(() => {
    if (reactColorA11yRef.current === null || reactColorA11yRef.current === undefined) {
      return () => {}
    }

    const mutationCallback = (): void => {
      if (reactColorA11yRef.current !== null && reactColorA11yRef.current !== undefined) {
        enforceColorsRecursively(reactColorA11yRef.current)
      }
    }
    mutationCallback()

    const observer = new MutationObserver(mutationCallback)

    observer.observe(reactColorA11yRef.current, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [reactColorA11yRef, colorPaletteKey, requiredContrastRatio, flipBlackAndWhite])

  if (!Array.isArray(children) && isValidElement(children)) {
    return cloneElement(children as React.ReactElement, {
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

ReactColorA11y.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  colorPaletteKey: PropTypes.string,
  requiredContrastRatio: PropTypes.number,
  flipBlackAndWhite: PropTypes.bool,
  preserveContrastDirectionIfPossible: PropTypes.bool
}

export default ReactColorA11y
