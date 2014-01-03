// Load Ember + Deps
require('script!jquery/jquery');
require('script!handlebars/handlebars');
require('script!ember/ember');

// Load QUnit
require('script!qunit/qunit/qunit.js');
require('style!css!qunit/qunit/qunit.css');

QUnit.config.autostart = false;

// Create Fixture Ember App
var App = Ember.Application.create({
  Resolver: require('../?' + __dirname)()
});

App.rootElement = '#qunit-fixture'
App.setupForTesting();
App.injectTestHelpers();
App.deferReadiness();

$(document).ready(function() {
  QUnit.start();
});

QUnit.testStart(function() {
  App.reset();
});

// Automatically load all tests (files that end with _test.js)
var requireTest = require.context('./', true, /_test\.js$/)
requireTest.keys().forEach(requireTest);
