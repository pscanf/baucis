// __Dependencies__
var deco = require('deco');
var express = require('express');
var Controller = require('../Controller');

// __Module Definition__
var Api = module.exports = deco(function (options) {
  var api = this;

  var middleware = api.middleware = express();

  api.use(middleware);
  
  // __Public Members___
  api.rest = function (model) {
    var controller = Controller(model);
    api.add(controller);
    return controller;
  };
});

Api.factory(express);
Api.defaults({ releases: [ '0.0.1' ] });
Api.decorators(__dirname);
Api.decorators(deco.builtin.setOptions);
