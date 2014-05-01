var BaucisError = require('../BaucisError');
var formatters = {};

var decorator = module.exports = function () {
  var api = this;

  api.formatters = function (response, callback) {
    var handlers = {
      default: function () {
        callback(BaucisError.NotAcceptable());
      }
    };
    Object.keys(formatters).map(function (mime) {
      handlers[mime] = formatters[mime](callback);
    });
    response.format(handlers);
  };

  // Adds a formatter for the given mime type.  Needs a function that returns a stream.
  api.setFormatter = function (mime, f) {
    formatters[mime] = function (callback) { return function () { callback(null, f) } };
    return api;
  };
};
