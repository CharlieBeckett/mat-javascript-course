/**
 * Page object for the view product page
 * @constructor
 * 
 */

var ViewProductPage = function() {

    /**
     * Used to create the locator for the product element (we don't know at this stage 
     * what our product name will be)
     */
    this.productName = function (product) {
        return element(by.cssContainingText('h2', product.name))

    }


}

module.exports = new ViewProductPage();
