// __Dependencies__
var mongoose = require('mongoose');
var semver = require('semver');
var Model = require('../Model');
var BaucisError = require('../BaucisError');

// __Module Definition__
var decorator = module.exports = function (model, protect) {
  var controller = this;

  if (typeof model !== 'string' && (!model || !model.schema)) {
    throw BaucisError.Configuration('You must pass in a model or model name');
  }

  // __Property Definitions__
  protect.property('comments', false);
  protect.property('hints', false);
  protect.property('locking', false);
  protect.property('relations', true);
  protect.property('select', '');
  protect.property('lastModified');
  protect.property('parentPath');

  protect.property('findBy', '_id', function (path) {
    var findByPath = controller.model().schema().path(path);
    if (!findByPath.options.unique && !(findByPath.options.index && findByPath.options.index.unique)) {
      throw BaucisError.Configuration('`findBy` path for model "%s" must be unique', controller.model().singular());
    }
    return path;
  });

  protect.property('versions', '*', function (range) {
    if (semver.validRange(range)) return range;
    throw BaucisError.Configuration('Controller version range "%s" was not a valid semver range', range);
  }); 

  protect.property('model', undefined, function (m) {
    var baucis = require('..');
    if (m instanceof Model) return m;
    if (typeof m === 'string') return baucis.model(m) || m;
    return Model(m);
  });

  protect.property(
    'baucisPath', 
    function (value) { 
      if (value === undefined) return '/' + this.model().plural();
      if (value.indexOf('/') !== 0) return '/' + value;
      return value;
    }
  );

  protect.property('children', [], function (child) {
    var children = this.children();
    if (!child) {
      throw BaucisError.Configuration('A child controller must be supplied when using the children poperty');
    }
    if (children.indexOf(child) !== -1) {
      throw BaucisError.Configuration('A controller was added as a child to the same parent contorller twice');
    }
    if (!child.parentPath()) child.parentPath(controller.model().singular());
    controller.use('/:parentId/:path', function (request, response, next) {
      var path = '/' + request.params.path;
      if (path !== child.baucisPath()) return next(); 
      request.baucis.parentId = request.params.parentId;
      child(request, response, next);
    });
    return children.concat(child);
  });

  protect.multiproperty('operators', false);
  protect.multiproperty('methods', true, function (enabled) {
    return enabled ? true : false;
  });

  controller.deselected = function (path) {
    var deselected = [];
    // Store naming, model, and schema.
    // Find deselected paths in the schema.
    controller.model().schema().eachPath(function (name, path) {
      if (path.options.select === false) deselected.push(name);
    });
    // Add deselected paths from the controller.
    controller.select().split(/\s+/).forEach(function (path) {
      var match = /^(?:[-]((?:[\w]|[-])+)\b)$/.exec(path);
      if (match) deselected.push(match[1]);
    });
    var finalized = deselected.filter(function(path, position) {
      return deselected.indexOf(path) === position;
    });

    if (arguments.length === 0) return finalized;
    else return (finalized.indexOf(path) !== -1);
  };

  // Set the controller model.
  controller.model(model);
};
