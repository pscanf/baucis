var deco = require('deco');
var mongoose = require('mongoose');
var pluralize = require('mongoose/lib/utils').toCollectionName;
var BaucisError = require('./BaucisError');

var Model = module.exports = deco(function (source, protect) {
  var model = this;

  if (!source) throw BaucisError.Configuration('Source must be set');

	protect.property('schema');
  protect.property('singular');
  protect.property('plural');
  protect.property('source', undefined, function (source) {
    if (this.source() !== undefined) throw BaucisError.Configuration('Source is readonly');
    // If it's a string, get the model from mongoose.
    if (typeof source === 'string') return mongoose.model(source);
    return source;
  });

  model.source(source);
  model.schema(model.source().schema);
  model.singular(model.source().modelName);
  model.plural(pluralize(model.singular()));
});
