/// <reference types="Cypress" />
/// <reference types="../cypress/cypress.d.ts" />

import React, { createRef, useState } from 'react'
import ReactColorA11y from './ReactColorA11y'

describe('ReactColorA11y', () => {
  const expectedColorMappings = [
    { original: 'rgb(0, 0, 0)', lighter: 'rgb(255, 255, 255)', darker: 'rgb(0, 0, 0)' },
    { original: 'rgb(30, 30, 30)', lighter: 'rgb(128, 128, 128)', darker: 'rgb(30, 30, 30)' },
    { original: 'rgb(18, 52, 86)', lighter: 'rgb(50, 131, 212)', darker: 'rgb(18, 52, 86)' },
    { original: 'rgb(255, 100, 200)', lighter: 'rgb(255, 100, 200)', darker: 'rgb(203, 0, 130)' },
    { original: 'rgb(120, 255, 120)', lighter: 'rgb(120, 255, 120)', darker: 'rgb(0, 122, 0)' },
    { original: 'rgb(255, 255, 255)', lighter: 'rgb(255, 255, 255)', darker: 'rgb(0, 0, 0)' }
  ]

  const lightBackground = 'rgb(230, 230, 230)'
  const darkBackground = 'rgb(25, 25, 25)'

  it('should lighten colors until required contrast reached', () => {
    cy.mount(
      <div style={{ backgroundColor: darkBackground }}>
        <ReactColorA11y flipBlackAndWhite>
          {expectedColorMappings.map(({ original }) => (
            <p key={original} style={{ color: original }}>{`${original} text`}</p>
          ))}
        </ReactColorA11y>
      </div>
    )

    expectedColorMappings.forEach(({ original, lighter }) => {
      cy.contains(`${original} text`).shouldHaveColor('css', 'color', lighter)
    })
  })

  it('should darken colors until required contrast reached', () => {
    cy.mount(
      <div style={{ backgroundColor: lightBackground }}>
        <ReactColorA11y flipBlackAndWhite>
          {expectedColorMappings.map(({ original }) => (
            <p key={original} style={{ color: original }}>{`${original} text`}</p>
          ))}
        </ReactColorA11y>
      </div>
    )

    expectedColorMappings.forEach(({ original, darker }) => {
      cy.contains(`${original} text`).shouldHaveColor('css', 'color', darker)
    })
  })

  it('should handle svg fill and stroke', () => {
    cy.mount(
      <div style={{ backgroundColor: darkBackground }}>
        <ReactColorA11y flipBlackAndWhite>
          <svg height={100} width={100}>
            {expectedColorMappings.map(({ original }, index) => (
              <circle id={index.toString()} key={original} cx={50} cy={50} r={50} stroke={original} fill={original} style={{ stroke: original, fill: original }} />
            ))}
          </svg>
        </ReactColorA11y>
      </div>
    )

    expectedColorMappings.forEach(({ lighter }, index) => {
      cy.get(`#${index}`).shouldHaveColor('attr', 'fill', lighter)
      cy.get(`#${index}`).shouldHaveColor('attr', 'stroke', lighter)
      cy.get(`#${index}`).shouldHaveColor('css', 'fill', lighter)
      cy.get(`#${index}`).shouldHaveColor('css', 'stroke', lighter)
    })
  })

  it('should handle svg gradients', () => {
    const gradientStops = (idPrefix: string) => expectedColorMappings.map(({ original }, index) => (
      <stop
        id={`${idPrefix}-${index}`}
        key={original}
        offset={`${Math.round(100 * (index + 0.5) / (expectedColorMappings.length))}%`}
        stopColor={original}
      />
    ))

    cy.mount(
      <div style={{ backgroundColor: darkBackground }}>
        <ReactColorA11y flipBlackAndWhite>
          <svg height={200} width={200}>
            <defs>
              <linearGradient id="linear-gradient">{gradientStops('linear')}</linearGradient>
              <radialGradient id="radial-gradient">{gradientStops('radial')}</radialGradient>
            </defs>
            <svg>
              <circle id="linear-circle" cx="50" cy="50" r="50" fill="url('#linear-gradient')" />
              <circle id="radial-circle" cx="150" cy="150" r="50" fill="url('#radial-gradient')" />
            </svg>
          </svg>
        </ReactColorA11y>
      </div>
    )

    expectedColorMappings.forEach(({ lighter }, index) => {
      cy.get(`#linear-${index}`).shouldHaveColor('attr', 'stop-color', lighter)
      cy.get(`#radial-${index}`).shouldHaveColor('attr', 'stop-color', lighter)
    })
  })

  describe('preserveContrastDirectionIfPossible', () => {
    describe('lighter starting direction', () => {
      const backgroundColor = 'rgb(150, 150, 150)'
      const foregroundColor = 'rgb(151, 151, 151)'

      it('should preserve lighter color if possible', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={2}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(211, 211, 211)')
      })

      it('should not preserve lighter color if that behavior is requested', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={2} preserveContrastDirectionIfPossible={false}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(101, 101, 101)')
      })

      it('should switch to darker color if needed to meet contrast', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={4.5}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(56, 56, 56)')
      })
    })

    describe('darker starting direction', () => {
      const backgroundColor = 'rgb(101, 101, 101)'
      const foregroundColor = 'rgb(99, 99, 99)'

      it('should preserve darker color if possible', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={2}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(65, 65, 65)')
      })

      it('should not preserve darker color if that behavior is requested', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={2} preserveContrastDirectionIfPossible={false}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(150, 150, 150)')
      })

      it('should switch to lighter color if needed to meet contrast', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={4.5}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(227, 227, 227)')
      })
    })
  })

  describe('ref handling', () => {
    const backgroundColor = 'rgb(101, 101, 101)'
    const foregroundColor = 'rgb(99, 99, 99)'

    it('should forward ref from consumer if provided', () => {
      const consumerRef = createRef<HTMLParagraphElement>()

      expect(consumerRef.current).to.be.null

      cy.mount(
        <div style={{ backgroundColor }}>
          <ReactColorA11y>
            <p ref={consumerRef} style={{ color: foregroundColor }}>{'text'}</p>
          </ReactColorA11y>
        </div>
      ).then(() => {
        cy.wait(1).then(() => {
          expect(consumerRef.current).to.not.be.null
        })
      })

      cy.contains('text').shouldHaveColor('css', 'color', 'rgb(227, 227, 227)')
    })
  })

  describe('backgroundColor prop', () => {
    it('should allow consumer to override background color if needed', () => {
      cy.mount(
        <div style={{ backgroundColor: 'rgb(0, 0, 0)' }}>
          <ReactColorA11y backgroundColorOverride='rgb(255, 255, 255)'>
            <p style={{ color: 'rgb(0, 0, 0)' }}>{'text'}</p>
          </ReactColorA11y>
        </div>
      )

      cy.contains('text').shouldHaveColor('css', 'color', 'rgb(0, 0, 0)')
    })
  })

  describe('transparency handling', () => {
    it('should consider alpha values when determining effective background', () => {
      cy.mount(
        <div style={{ backgroundColor: 'rgb(0, 0, 0)' }}>
          <div style={{ backgroundColor: 'rgb(255, 200, 200, 0.05)' }}>
            <div style={{ backgroundColor: 'rgb(200, 255, 200, 0.1)' }}>
              <ReactColorA11y>
                <p style={{ color: 'rgb(10, 10, 10)' }}>{'text'}</p>
              </ReactColorA11y>
            </div>
          </div>
        </div >
      )

      cy.contains('text').shouldHaveColor('css', 'color', 'rgb(139, 139, 139)')
    })
  })

  describe('ignoreColorA11y attribute', () => {
    it('should ignore elements which have the ignoreColorA11y data attribute set', () => {
      cy.mount(
        <div style={{ backgroundColor: 'rgb(0, 0, 0)' }}>
          <ReactColorA11y>
            <p data-ignore-color-a11y style={{ color: 'rgb(10, 10, 10)' }}>{'ignored'}</p>
            <p style={{ color: 'rgb(0, 50, 100)' }}>{'not ignored'}</p>
          </ReactColorA11y>
        </div>
      )

      cy.contains('ignored').shouldHaveColor('css', 'color', 'rgb(10, 10, 10)')
      cy.contains('not ignored').shouldHaveColor('css', 'color', 'rgb(0, 112, 222)')
    })
  })

  describe('ancestor background change detection', () => {
    const TestComponent = () => {
      const [colorPalette, setColorPalette] = useState('light')

      return (
        <div style={{ backgroundColor: colorPalette === 'dark' ? darkBackground : lightBackground }}>
          <button onClick={() => setColorPalette('dark')}>dark mode</button>
          <ReactColorA11y flipBlackAndWhite>
            {expectedColorMappings.map(({ original }) => (
              <p key={original} style={{ color: original }}>{`${original} text`}</p>
            ))}
          </ReactColorA11y>
        </div>
      )
    }

    it('should re-evaluate colors when ancestor background color changes', () => {
      cy.mount(<TestComponent />)

      expectedColorMappings.forEach(({ original, darker }) => {
        cy.contains(`${original} text`).shouldHaveColor('css', 'color', darker)
      })

      cy.contains('dark mode').click()

      expectedColorMappings.forEach(({ original, lighter }) => {
        cy.contains(`${original} text`).shouldHaveColor('css', 'color', lighter)
      })
    })
  })

  describe('automatic style change detection', () => {
    it('should re-evaluate colors when inline style is changed directly on DOM', () => {
      cy.mount(
        <div style={{ backgroundColor: darkBackground }}>
          <ReactColorA11y flipBlackAndWhite>
            <p id="test-direct" style={{ color: 'rgb(0, 0, 0)' }}>{'styled text'}</p>
          </ReactColorA11y>
        </div>
      )

      // Initially black flipped to white on dark background
      cy.get('#test-direct').shouldHaveColor('css', 'color', 'rgb(255, 255, 255)')

      // Directly modify the DOM inline style
      cy.get('#test-direct').then(($el) => {
        $el[0].style.color = 'rgb(255, 100, 200)'
      })

      // Should detect the change and keep it (already has enough contrast on dark)
      cy.get('#test-direct').shouldHaveColor('css', 'color', 'rgb(255, 100, 200)')
    })

    it('should re-evaluate colors when child inline styles change', () => {
      const TestComponent = () => {
        const [fgColor, setFgColor] = useState('rgb(0, 0, 0)')

        return (
          <div style={{ backgroundColor: darkBackground }}>
            <button style={{ color: 'white' }} onClick={() => setFgColor('rgb(255, 100, 200)')}>change color</button>
            <ReactColorA11y flipBlackAndWhite>
              <div>
                <p style={{ color: fgColor }}>{'styled text'}</p>
              </div>
            </ReactColorA11y>
          </div>
        )
      }

      cy.mount(<TestComponent />)

      // rgb(0,0,0) on dark background with flipBlackAndWhite → white
      cy.contains('styled text').shouldHaveColor('css', 'color', 'rgb(255, 255, 255)')

      cy.contains('change color').click()

      // rgb(255,100,200) on dark background → stays as-is (already has contrast)
      cy.contains('styled text').shouldHaveColor('css', 'color', 'rgb(255, 100, 200)')
    })

    it('should re-evaluate colors when SVG fill attribute changes', () => {
      const TestComponent = () => {
        const [fillColor, setFillColor] = useState('rgb(255, 255, 255)')

        return (
          <div style={{ backgroundColor: darkBackground }}>
            <button style={{ color: 'white' }} onClick={() => setFillColor('rgb(0, 0, 0)')}>change fill</button>
            <ReactColorA11y flipBlackAndWhite>
              <svg height={100} width={100}>
                <circle id="auto-circle" cx={50} cy={50} r={50} fill={fillColor} />
              </svg>
            </ReactColorA11y>
          </div>
        )
      }

      cy.mount(<TestComponent />)

      // White fill on dark background → already has contrast
      cy.get('#auto-circle').shouldHaveColor('attr', 'fill', 'rgb(255, 255, 255)')

      cy.contains('change fill').click()

      // Black fill on dark with flipBlackAndWhite → white
      cy.get('#auto-circle').shouldHaveColor('attr', 'fill', 'rgb(255, 255, 255)')
    })

    it('should not lose foreground update after background change (regression)', () => {
      // Reproduces: fg→color1, bg changes, fg→color2 — the last fg change must not be lost.
      // Uses high-contrast colors that pass through without adjustment.
      const TestComponent = () => {
        const [bg, setBg] = useState('rgb(0, 0, 0)')
        const [fg, setFg] = useState('rgb(200, 200, 200)')

        return (
          <div>
            <button style={{ color: 'white' }} onClick={() => setFg('rgb(255, 255, 255)')}>fg white</button>
            <button style={{ color: 'white' }} onClick={() => setBg('rgb(255, 255, 255)')}>bg white</button>
            <button style={{ color: 'white' }} onClick={() => setFg('rgb(0, 0, 0)')}>fg black</button>
            <ReactColorA11y>
              <div style={{ backgroundColor: bg }}>
                <p style={{ color: fg }}>{'test text'}</p>
              </div>
            </ReactColorA11y>
          </div>
        )
      }

      cy.mount(<TestComponent />)

      // Initial: light gray on black → already high contrast
      cy.contains('test text').shouldHaveColor('css', 'color', 'rgb(200, 200, 200)')

      // Step 1: change foreground to white (max contrast on black bg)
      cy.contains('fg white').click()
      cy.contains('test text').shouldHaveColor('css', 'color', 'rgb(255, 255, 255)')

      // Step 2: change background to white
      cy.contains('bg white').click()

      // Step 3: change foreground to black (max contrast on white bg) — must not stay white
      cy.contains('fg black').click()
      cy.contains('test text').shouldHaveColor('css', 'color', 'rgb(0, 0, 0)')
    })
  })
})
