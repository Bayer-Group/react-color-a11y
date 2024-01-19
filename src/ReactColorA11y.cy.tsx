/// <reference types="Cypress" />
/// <reference types="../cypress/cypress.d.ts" />

import React, { createRef } from 'react'
import ReactColorA11y from './ReactColorA11y'

describe('ReactColorA11y', () => {
  const expectedColorMappings = [
    { original: 'rgb(0, 0, 0)', lighter: 'rgb(255, 255, 255)', darker: 'rgb(0, 0, 0)' },
    { original: 'rgb(30, 30, 30)', lighter: 'rgb(132, 132, 132)', darker: 'rgb(30, 30, 30)' },
    { original: 'rgb(18, 52, 86)', lighter: 'rgb(54, 134, 213)', darker: 'rgb(18, 52, 86)' },
    { original: 'rgb(255, 100, 200)', lighter: 'rgb(255, 100, 200)', darker: 'rgb(197, 0, 127)' },
    { original: 'rgb(120, 255, 120)', lighter: 'rgb(120, 255, 120)', darker: 'rgb(0, 120, 0)' },
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

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(212, 212, 212)')
      })

      it('should not preserve lighter color if that behavior is requested', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={2} preserveContrastDirectionIfPossible={false}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(97, 97, 97)')
      })

      it('should switch to darker color if needed to meet contrast', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={4.5}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(41, 41, 41)')
      })
    })

    describe('darker starting direction', () => {
      const backgroundColor = 'rgb(100, 100, 100)'
      const foregroundColor = 'rgb(99, 99, 99)'

      it('should preserve darker color if possible', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={2}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(51, 51, 51)')
      })

      it('should not preserve darker color if that behavior is requested', () => {
        cy.mount(
          <div style={{ backgroundColor }}>
            <ReactColorA11y requiredContrastRatio={2} preserveContrastDirectionIfPossible={false}>
              <p style={{ color: foregroundColor }}>{'text'}</p>
            </ReactColorA11y>
          </div>
        )

        cy.contains('text').shouldHaveColor('css', 'color', 'rgb(153, 153, 153)')
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
    const backgroundColor = 'rgb(100, 100, 100)'
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
        expect(consumerRef.current).to.not.be.null
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

      cy.contains('text').shouldHaveColor('css', 'color', 'rgb(143, 143, 143)')
    })
  })
})
