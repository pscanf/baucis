var mongoose = require('mongoose');
var expect = require('expect.js');
var express = require('express');
var request = require('request');
var baucis = require('..');

var fixtures = require('./fixtures');

describe('Plugins', function () {
  before(fixtures['deep-populate'].init);
  before(fixtures['deep-populate'].create);
  beforeEach(baucis.empty.bind(baucis));
  after(fixtures['deep-populate'].deinit);

  it.skip('works with mongoose-deep-populate', function (done) {
    var options = {
      url: 'http://localhost:8012/api/posts',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(body).to.have.length(1);
      expect(body[0]).to.have.property('comments');
      expect(body[0].comments).to.have.length(1);
      var s = mongoose.model('post').find({}).deepPopulate('comments.user').stream();

      s.on('error', done);
      s.on('end', done);
      s.on('data', function (post) {
        expect(post).to.have.property('comments');
        expect(post.comments).to.have.length(1);
        expect(body[0].comments[0]).to.eql(post.comments[0].toString());
      });
    });
  });

});
