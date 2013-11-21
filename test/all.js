// Load Ember + Deps
require('script!jquery/jquery');
require('script!handlebars/handlebars');
require('script!ember/ember');

// Create Fixture Ember App
window.App = Ember.Application.create({
  Resolver: require('../?' + __dirname)()
});

require('./resolve.test.js');
