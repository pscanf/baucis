// __Dependencies__
var util = require('util');
var BaucisError = require('../../BaucisError');

// __Module Definition__
var decorator = module.exports = function () {
  var controller = this;
  var check = ['ObjectID', 'Number'];

  function isInvalid (id, instance, type) {
    var error;
    if (!id) return false;
    if (check.indexOf(instance) === -1) return false;
    if (instance === 'ObjectID' && id.match(/^[a-f0-9]{24}$/i)) return false;
    if (instance === 'Number' && !isNaN(Number(id))) return false;
    return {
      message: util.format('The requested document ID "%s" is not a valid document ID', id),
      name: 'BaucisError',
      path: '/:id',
      type: 'url.id',
      value: id
    };
  }

  function calculateInstance (c) {
    if (!c) return undefined;
    return c.model().schema.path(c.findBy()).instance;
  }

  // Validate URL's ID parameter, if any.
  controller.request(function (request, response, next) {
    var id = request.params.id;
    var parentId = request.params.parentId;
    var instance = calculateInstance(controller);
    var parentInstance = calculateInstance(controller.parentController());
    var invalid = isInvalid(request.params.id, instance, 'url.id');
    var parentInvalid = isInvalid(parentId, parentInstance, 'url.parentId');
    var error;

    if (!invalid && !parentInvalid) return next();

    error = BaucisError.ValidationError('The requested document ID "%s" is not a valid document ID', id);
    error.errors = {};

    if (invalid) error.errors.id = invalid;
    if (parentInvalid) error.errors.parentId = parentInvalid;

    next(error);
  });

  // Check that the HTTP method has not been disabled for this controller.
  controller.request(function (request, response, next) {
    var method = request.method.toLowerCase();
    if (controller.methods(method) !== false) return next();
    next(BaucisError.MethodNotAllowed('The requested method has been disabled for this resource'));
  });

  // Treat the addressed document as a collection, and push the addressed object
  // to it.  (Not implemented.)
  controller.request('instance', 'post', function (request, response, next) {
    return next(BaucisError.NotImplemented('Cannot POST to an instance'));
  });

  // Update all given docs.  (Not implemented.)
  controller.request('collection', 'put', function (request, response, next) {
    return next(BaucisError.NotImplemented('Cannot PUT to the collection'));
  });
};
