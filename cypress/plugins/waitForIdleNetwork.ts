export const waitForIdleNetwork = () => {
  cy.window({ log: false }).then(
      { timeout: 10000 },
      win =>
          new Cypress.Promise((resolve, reject) =>
            win.requestIdleCallback(resolve)
          )
  )
}
