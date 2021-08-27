/// <reference types="cypress" />
import { waitForIdleNetwork } from '../plugins/waitForIdleNetwork'

describe('The LiÖ landing page', () => {
  it('loads without crashing', () => {
    cy.visit('/')
  })
  it('finds a populous austrian place in the Omni Search Box', () => {
    const placename = 'Wien'
    waitForIdleNetwork()
    cy.get('[test-id=omni-search]')
      .type(placename)
    waitForIdleNetwork()
    cy.get('[test-id=omni-search-result]')
      .contains(placename)
      .should('exist')
  })
  // it('can open a place in the map', () => {
  //   cy.get('[test-id=omni-search-result]')
  //     .contains('karte anzeigen', { matchCase: false })
  //     .click()
  // })
})
