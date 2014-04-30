// __Module Definition__
var decorator = module.exports = function () {
  var controller = this;

  controller.query('collection', '*', function (request, response, next) {
    var Model = controller.model().source();
    request.baucis.query = Model.find(request.baucis.conditions);
    next();
  });

  controller.query('instance', '*', function (request, response, next) {
    var Model = controller.model().source();
    request.baucis.query = Model.findOne(request.baucis.conditions);
    next();
  });
};
