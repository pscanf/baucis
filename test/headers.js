var expect = require('expect.js');
var mongoose = require('mongoose');
var express = require('express');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var request = require('request').defaults({ json: true });
var baucis = require('..');

var fixtures = require('./fixtures');

describe('Headers', function () {
  before(fixtures.vegetable.init);
  beforeEach(fixtures.vegetable.create);
  after(fixtures.vegetable.deinit);

  it('sets Last-Modified for single documents', function (done) {
    var turnip = vegetables[0];
    var options = {
      url: 'http://localhost:8012/api/vegetables/' + turnip._id
    };
    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('last-modified');
      var modified = response.headers['last-modified'];
      var httpDate = new Date(modified).toUTCString();
      expect(modified).to.be(httpDate);

      request.get(options, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.be(200);
        expect(response.headers).to.have.property('last-modified', httpDate);
        done();
      });
    });
  });

  it('sets Last-Modified for the collection', function (done) {
    var updates = vegetables.map(function (vegetable) {
      return vegetable.lastModified;
    });
    var max = new Date(Math.max.apply(null, updates));
    var httpDate = new Date(max).toUTCString();

    var options = {
      url: 'http://localhost:8012/api/vegetables'
    };

    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('last-modified', httpDate);

      request.get(options, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.be(200);
        expect(response.headers.trailer).to.be('Last-Modified, Etag');
        expect(response.headers['content-type']).to.be('application/json');
        expect(response.headers['transfer-encoding']).to.be('chunked');
        expect(response.trailers).to.have.property('last-modified', httpDate);
        done();
      });
    });
  });

  it('sets Etag for single documents', function (done) {
    var turnip = vegetables[0];
    var options = {
      url: 'http://localhost:8012/api/vegetables/' + turnip._id
    };
    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      var etag = response.headers.etag;
      expect(etag).to.match(/^"[0-9a-z]{32}"$/);
      request.get(options, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.be(200);
        expect(response.headers.etag).to.be(etag)
        done();
      });
    });
  });

  it('sets Etag for the collection', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables'
    };
    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      var etag = response.headers.etag;
      expect(etag).to.match(/^"[0-9a-z]{32}"$/);
      request.get(options, function (error, response, body) {
      if (error) return done(error);
        expect(response.statusCode).to.be(200);
        expect(response.headers.trailer).to.be('Last-Modified, Etag');
        expect(response.headers['content-type']).to.be('application/json');
        expect(response.headers['transfer-encoding']).to.be('chunked');
        expect(response.trailers.etag).to.be(etag);
        done();
      });
    });
  });

  it('sets Allowed', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables'
    };
    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).to.have.property('allow', 'HEAD,GET,POST,PUT,DELETE');
      done();
    });
  });

  it('sends 406 Not Acceptable when the requested type is not accepted', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      headers: {
        'Accept': 'application/xml'
      }
    };
    request.get(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(406);
      expect(response.headers).to.have.property('content-type', 'text/html; charset=utf-8');
      expect(body).to.be('Not Acceptable: The requested content type could not be provided (406).\n');
      done();
    });
  });

  it('should send 415 Unsupported Media Type when the request content type cannot be parsed', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      headers: {
        'Content-Type': 'application/xml'
      }
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(415);
      expect(body).to.have.property('message', "The request's content type is unsupported (415).");
      done();
    });
  });

  it('should match the correct MIME type, ignoring extra options and linear whitespace', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      headers: {
        'Content-Type': '     application/json        ;       charset=UTF-8    cheese=roquefort      '
      },
      json: { name: 'Tomatillo' }
    };
    request.post(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(201);
      done();
    });
  });

  it('should not set X-Powered-By', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables'
    };
    request.head(options, function (error, response, body) {
      if (error) return done(error);
      expect(response.statusCode).to.be(200);
      expect(response.headers).not.to.have.property('x-powered-by');
      done();
    });
  });

});
