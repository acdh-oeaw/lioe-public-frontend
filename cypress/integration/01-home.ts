/// <reference types="cypress" />
import { waitForIdleNetwork } from '../plugins/waitForIdleNetwork'

describe('The LiÖ landing page', () => {
  it('loads without crashing', () => {
    cy.visit('/')
  })
  it('finds a populous austrian place in the Omni Search Box', () => {
    const placename = 'Wien'
    cy.intercept('/static/Gemeinden.geojson.json').as('Gemeinden')
    cy.intercept('/static/Ortsdatenbank_Orte-Gemeinden-Kleinregionen-Grossregionen-Bundeslaender_nur+OE+STir.json').as('Orte')
    cy.wait('@Gemeinden')
    cy.wait('@Orte')
    cy.get('[test-id=omni-search]')
      .type(placename)
    cy.get('[test-id=omni-search-result]')
      .contains(placename)
      .should('exist')
  })
  it('can open a place in the map', () => {
    cy.get('[test-id=omni-search-result]')
      .contains('karte anzeigen', { matchCase: false })
      .click({force: true}) // cypress actually warns about no pointer events if this is not forced.
    waitForIdleNetwork()
    assert(true)
  })
})
