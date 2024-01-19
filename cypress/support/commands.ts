/// <reference types="cypress" />

import { colord } from 'colord'

const expectColorsToMatch = (color1: string, color2: string) => {
  expect(Boolean(color1), 'expected both color to be defined or undefined').to.equal(Boolean(color2))
  expect(colord(color1).toHex()).to.be.equal(colord(color2).toHex())
}

Cypress.Commands.addQuery('shouldHaveColor', function (type: 'attr' | 'css', property: string, expectedColor: string) {
  return ($el: JQuery) => {
    expect(type).to.be.oneOf(['attr', 'css'])

    if (type === 'attr') {
      expectColorsToMatch($el.attr(property), expectedColor)
    } else if (type === 'css') {
      expectColorsToMatch($el.css(property), expectedColor)
    }

    return $el
  }
})
