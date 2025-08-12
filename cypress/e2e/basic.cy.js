describe('Landing Page', () => {
  it('should load and display the hero title', () => {
    cy.visit('/');
    cy.contains('BookLocal');
  });
});
