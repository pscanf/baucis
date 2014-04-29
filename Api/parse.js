var parsers = {};

var decorator = module.exports = function () {
  var api = this;

  api.parser = function (mime) {
    // Default to JSON when no MIME type is provided.
    mime = mime || 'application/json';
    // Not interested in any additional parameters at this point.
    mime = mime.split(';')[0].trim();
    var handler = parsers[mime];
    return handler ? handler() : undefined;
  };

  // Adds a parser for the given mime type.  Needs a function that returns a stream.
  api.setParser = function (mime, f) {
    parsers[mime] = f;
    return api;
  };
};
