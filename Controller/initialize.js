// __Dependencies__
var express = require('express');
var BaucisError = require('../BaucisError');

// __Module Definition__
var decorator = module.exports = function () {
  var controller = this;
  // Set up `request.baucis`.
  controller.request(function (request, response, next) {
    if (request.baucis) return next(new Error()); //next(BaucisError.Configuration('Baucis request property already created'));
    request.baucis = {};
    request.baucis.api = controller.api();
    request.baucis.controller = controller;
    response.removeHeader('x-powered-by')
    next();
  });
};
