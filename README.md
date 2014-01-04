# ember-webpack-resolver

> An Ember.js resolver heavily inspired by
https://github.com/stefanpenner/ember-jj-abrams-resolver but mainly for use with webpack.

## Install

``` shell
npm install ember-webpack-resolver --save-dev
```

## Usage

This resolver is intended to resolve modules with a folder structure like such:

```
| - app/
| --- components/
| --- controllers/
| --- models/
| --- routes/
| --- templates/
| --- views/
| --- app.js
| --- router.js
| - node_modules/
| --- some-widget-ember-component
| ----- index.js
| ----- index.hbs
| - bower_components/
| --- some-other-ember-component
| ----- index.js
| ----- index.hbs
```

A very simple config will resolve just your local modules:

``` javascript
var App = Ember.Application.create({
  Resolver: require('ember-webpack-resolver?' + __dirname)()
});
```

If you're using a file extension other than `.js`, supply the lookup extensions such use with coffeescript:

``` javascript
var App = Ember.Application.create({
  Resolver: require('ember-webpack-resolver?' + __dirname)({
    extensions: ['.coffee', '.hbs']
  })
});
```

### Resolving Components
If you want to also resolve modules within vendor folders, a bit more configuration is required:

``` javascript
var App = Ember.Application.create({
  Resolver: require('ember-webpack-resolver?' + __dirname)({
    components: {
      'some-widget': require('some-widget-ember-component'),
      'other-widget': require('some-other-ember-component')
    }
  })
});
```

Then it will resolve to the specified module when inserted into your template:

``` html
<h1>{{some-widget value="Hooray!"}}</h1>
<p>{{#other-widget}}Stuff{{/other-widget}}</p>
```

---

*To resolve modules within the `bower_components` folder, be sure to add the folder to your webpack config:*

``` javascript
module.exports = {
  // ...
  resolve: {
    moduleDirectories: ["node_modules", "bower_components"]
  }
};
```

---

## Release History
* 0.3.0 - simplify resolving components
* 0.2.0 - handle nested components, update API
* 0.1.0 - initial release

## License
Copyright (c) 2013 Kyle Robinson Young  
Licensed under the MIT license.
