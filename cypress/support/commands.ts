/// <reference types="cypress" />

import { colord, extend as extendColord } from 'colord'
import colordLabPlugin from 'colord/plugins/lab'

extendColord([colordLabPlugin])

const expectColorsToMatch = (color1: string | undefined, color2: string | undefined) => {
  expect(Boolean(color1), 'expected both color to be defined or undefined').to.equal(Boolean(color2))
  if (color1 && color2) {
    const delta = 0.005
    if (colord(color1).delta(colord(color2)) > delta) {
      throw new Error(`expected colors to match: ${color1} vs ${color2} (allowed delta: ${delta})`)
    }
  }
}

export const shouldHaveColor = function (this: unknown, type: 'attr' | 'css', property: string, expectedColor: string): ($el: JQuery) => JQuery<HTMLElement> {
  return ($el: JQuery) => {
    expect(type).to.be.oneOf(['attr', 'css'])

    if (type === 'attr') {
      expectColorsToMatch($el.attr(property), expectedColor)
    } else if (type === 'css') {
      expectColorsToMatch($el.css(property), expectedColor)
    }

    return $el
  }
}

Cypress.Commands.addQuery('shouldHaveColor', shouldHaveColor)
