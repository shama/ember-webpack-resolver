module.exports = Ember.Component.extend({
    tagName: "button",
    classNames: ["bear"],
    wasClicked: false,
    click() {
        this.toggleProperty("wasClicked")
    }
})