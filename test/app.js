// Load Ember + Deps
require("expose-loader?$!expose-loader?jQuery!jquery/dist/jquery.min.js")

window.Ember = {}
// This will include Ember in a more readable way, rather than using eval on it
require("expose-loader?unused_var!ember-source/dist/ember.debug.js")

// Use RSVP from Ember for Promises
window.RSVP = Ember.RSVP
window.Promise = Ember.RSVP.Promise

require("script-loader!ember-source/dist/ember-testing.js")

// Load QUnit
require("script-loader!qunitjs/qunit/qunit.js")
require("style-loader!css-loader!qunitjs/qunit/qunit.css")

QUnit.config.autostart = false;

// Create Fixture Ember App
const App = Ember.Application.extend({
  Resolver: require('../?' + __dirname)()
});

const app = App.create({
  rootElement: "#qunit-fixture",
  LOG_ACTIVE_GENERATION: true,
  LOG_VIEW_LOOKUPS: false
})

app.setupForTesting();
app.injectTestHelpers();
//App.deferReadiness();

$(document).ready(function() {
  QUnit.start();
});

QUnit.testStart(function() {
  app.reset();
});

// Automatically load all tests (files that end with _test.js)
var requireTest = require.context('./', true, /_test\.js$/)
requireTest.keys().forEach(requireTest);
