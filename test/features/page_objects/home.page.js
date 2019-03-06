/**
 * Page object for Crud hompage
 * 
 */

var HomePage = function () {

    /**
     * Add product button
     */

     // The $ symbol is unique to protractor and us a shortcut for element(by.cssSelector)
    this.addProduct = $('.mat-flat-button','.mat-primary');

    /**
     * Used to create the locator for the Product element 
     * (we don't know the what our product name will be)
     * @param {object} Product
     * @returns {ElementFinder} Element
     */
    this.productInTable = function (product) {
        return Element(by.cssContainingText('.mat-cell'), product.name);

    }

}

module.exports = new HomePage();
