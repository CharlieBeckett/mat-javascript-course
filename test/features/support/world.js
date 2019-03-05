'use strict';
var World = function World() {
  this.product = undefined;
  this.openWebsite = function() {
  browser.waitForAngularEnabled(false);
  return browser.get('');
  }
};
module.exports.World = World;