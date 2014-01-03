module.exports = Ember.View.extend({
  tagName: 'button',
  classNames: ['bear'],
  click: function() {
    this.$().text('IM A BEAR, RAWR');
  }
});