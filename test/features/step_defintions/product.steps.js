const actions = require('../support/actions');
const homepage = require('../page_objects/home.page');
const addProductPage = require('../page_objects/add-product.page');
const viewProductPage = require('../page_objects/view-product-page');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const {Before,Given, When, Then} = require('cucumber');
const {setWorldConstructor} = require('cucumber');
const CustomWorld = require('../support/world').World;

setWorldConstructor(CustomWorld);

Before(function() {
  this.openWebsite();
});

Given('a product doesnt exist', function (dataTable) {
  console.log('before');
    var data = dataTable.hashes();
    console.log(data);  
    this.product = data[0];

    return expect(actions.isElementOnPage(homepage.productInTable(this.product))).to.eventually.be.false;
    
  });

  When('I add the product', function () {

    // Break point
    //debugger ;
    // run 'npm run debug' open 'chrome://inspect/#devices' and click 'inspect'
    actions.click(homepage.addProduct);
    actions.type(addProductPage.productName, this.product.name);
    actions.type(addProductPage.productDescription, this.product.description);
    actions.type(addProductPage.productPrice, this.product.price);

    return actions.click(addProductPage.submitButton);
  });

  Then('the product is created', function () { 
    return expect(actions.waitForElement(viewProductPage.productName(this.product))).to.eventually.be.true;

  });
