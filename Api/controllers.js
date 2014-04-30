// __Dependencies__
var util = require('util');
var semver = require('semver');
var BaucisError = require('../BaucisError');

// __Module Definition__
var plugin = module.exports = function () {
  var api = this;
  var controllers = [];

  // __Public Instance Members__
  // Add a controller to the API.
  api.add = function (controller) {
    controller.api(api);
    controllers.push(controller);
    return api;
  };
  // Check the requested API version is valid.
  api.middleware.use(function (request, response, next) {
    var range = request.headers['api-version'] || '*';
    if (semver.validRange(range)) return next();
    next(BaucisError.BadRequest('The requested API version range "%s" was not a valid semver range', range));
  });
  // Check for API version unsatisfied and give a 400 if no versions match.
  api.middleware.use(function (request, response, next) {
    var range = request.headers['api-version'] || '*';
    var apiVersionMatch = api.releases().some(function (release) {
      return semver.satisfies(release, range);
    });
    if (apiVersionMatch) return next();
    next(BaucisError.BadRequest('The requested API version range "%s" could not be satisfied', range));
  });
  // Find the correct controller to handle the request.  
  api.middleware.use('/:path', function (request, response, next) {
    var stop = false;
    var path = '/' + request.params.path;
    // Requested range is used to select highest possible release number.
    // Then later controllers are checked for matching the release number.
    var range = request.headers['api-version'] || '*';
    var release = semver.maxSatisfying(api.releases(), range);
    // Set API-related headers
    response.set('API-Version', release);
    response.set('Vary', 'API-Version')
    // Filter to only controllers that match the requested release.
    var filteredControllers = controllers.filter(function (controller) {
      return semver.satisfies(release, controller.versions());
    });
    // Find the matching controller, if any.
    filteredControllers.forEach(function (controller) {
      if (stop) return;
      if (path !== controller.baucisPath()) return; 
      // Path and version match.
      stop = true;
      controller(request, response, next);
    });
    if (!stop) next(BaucisError.Configuration('No mamsd'));
  });
};
