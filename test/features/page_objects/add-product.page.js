/**
 * Page object for the 'add product' page
 * @constructor
 */

var AddProductPage = function() {

    /**
     * Bind the variables to the elements on the page
     * 
     */
    this.productName =$('#mat-input-0');
    this.productDescription = $('#mat-input-1');
    this.productDescription = $('#mat-input-2');
    this.submitButton = $('[type=submit]');

}

module.exports = new AddProductPage();