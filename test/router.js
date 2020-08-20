const Router = Ember.Router.extend({
  location: "history"
})

export default Router

Router.map(function() {
  this.route('bear')
})
