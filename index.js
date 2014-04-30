// __Dependencies__
var deco = require('deco');
var mongoose = require('mongoose');
var Api = require('./Api');
var Controller = require('./Controller');
var Model = require('./Model');
var BaucisError = require('./BaucisError');
var plugins = {
  json: require('baucis-json')
};

var instance = Api();
var models = [];

// __Module Definition__
var baucis = module.exports = function (options) {
  var previous = baucis.empty();

  if (options && options.releases) previous.releases(options.releases);

  return previous;
};

// __Public Members__
baucis.rest = function (model) {
  return instance.rest(model);
};

baucis.empty = function () {
  var previous = instance;
  instance = Api();
  return previous;
};

baucis.model = function (name, source) {
  function getter () {
    return models.filter(function (model) {
      return model.singular() === name;
    })[0];
  };
  function setter () {
    var model;
    var keys = Object.keys(mongoose.models).filter(function (key) { 
      return mongoose.models[key].schema === source 
    });
    if (keys.length === 0) model = Model(mongoose.model(name, source));
    else model = Model(mongoose.model(keys[0]));
    model.singular(name);
    models.push(model);
    return model;
  };

  if (arguments.length === 1) return getter();
  else return setter();
};

// __Expose Modules__
baucis.Api = Api;
baucis.Controller = Controller;
baucis.Error = BaucisError;
baucis.Model = Model;

Api.container(baucis);
Controller.container(baucis);
BaucisError.container(baucis);
Model.container(baucis);

// __Plugins__
plugins.json.apply(baucis);
