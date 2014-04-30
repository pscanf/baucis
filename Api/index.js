// __Dependencies__
var deco = require('deco');
var semver = require('semver');
var express = require('express');
var Controller = require('../Controller');
var BaucisError = require('../BaucisError');

// __Module Definition__
var Api = module.exports = deco(function (options, protect) {
  var api = this;

  var middleware = api.middleware = express();

  api.use(middleware);
  
  // __Public Members___
  protect.property('releases', [ '0.0.1' ], function (release) {
    if (!semver.valid(release)) {
      throw BaucisError.Configuration('Release version "%s" is not a valid semver version', release);
    }
    return this.releases().concat(release);
  });

  api.rest = function (model) {
    var controller = Controller(model);
    api.add(controller);
    return controller;
  };
});

Api.factory(express.Router);
Api.decorators(__dirname);