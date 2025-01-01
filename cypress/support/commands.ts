/// <reference types="cypress" />

import { colord } from 'colord'

const expectColorsToMatch = (color1: string | undefined, color2: string | undefined) => {
  expect(Boolean(color1), 'expected both color to be defined or undefined').to.equal(Boolean(color2))
  if (color1 && color2) {
    expect(colord(color1).toHex()).to.be.equal(colord(color2).toHex())
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
