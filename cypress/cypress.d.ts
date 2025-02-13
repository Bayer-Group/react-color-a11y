import { mount } from 'cypress/react'
import { shouldHaveColor } from './support/commands'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      shouldHaveColor: typeof shouldHaveColor
    }
  }
}
