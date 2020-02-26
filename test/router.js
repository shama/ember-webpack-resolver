const Router = module.exports = Ember.Router.extend({
  location: "history"
})

Router.map(function() {
  this.route('bear')
})
