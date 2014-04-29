var util = require('util');
var semver = require('semver');
var mongoose = require('mongoose');
var BaucisError = require('../BaucisError');

var plugin = module.exports = function () {
  var api = this;

  api.use(function (error, request, response, next) {
    if (!error) return next();
    // Just set the status code for these errors.
    if (error instanceof BaucisError) {
      response.status(error.status);
      next(error);
      return;
    }
    if (error instanceof mongoose.Error.VersionError) {
      response.status(409);
      next(error);
      return;
    }
    // These are validation errors.
    if (error instanceof mongoose.Error.ValidationError) {
      response.status(422);
      response.json(error.errors);
      return;
    }
    if (error.message.indexOf('E11000 duplicate key error') !== -1) {
      var body = {};
      var scrape = /[$](.+)[_]\d+\s+dup key: [{] : "([^"]+)" [}]/;
      var scraped = scrape.exec(error.message);
      var path = scraped ? scraped[1] : '???';
      var value = scraped ? scraped[2] : '???';
      body[path] = {
        message: util.format('Path `%s` (%s) must be unique.', path, value),
        originalMessage: error.message,
        name: 'MongoError',
        path: path,
        type: 'unique',
        value: value
      };
      response.status(422);
      response.json(body);
      return;
    }
    // Pass other kinds of errors on to be handled elsewhere (or not).
    next(error);
  });
};