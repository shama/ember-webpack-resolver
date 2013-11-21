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
    extensions: ['.coffee', '.hbs'],
  })
});
```

### Resolving Components
If you want to also resolve modules within vendor folders, a bit more configuration is required:

``` javascript
var App = Ember.Application.create({
  Resolver: require('ember-webpack-resolver?' + __dirname)({
    component: [{
      context: require.context('../node_modules/', true, /(.+)-ember-component\/index/),
      format: '%@-ember-component/index'
    }]
  })
});
```

This will look for modules within the `node_modules/` folder that end with `-ember-component/index`.

``` javascript
// node_modules/some-widget-ember-component/index.js
module.exports = Ember.Component.extend({
  defaultTemplate: require('./index.hbs'),
  classNames: ['some-widget']
});
```

``` html
<!-- node_modules/some-widget-ember-component/index.hbs -->
<div {{bindAttr width="width" height="height"}}>SOME WIDGET</div>
```

You can still explicitly require your components and dynamically set the template name:

``` javascript
App.AnotherWidgetComponent = require('some-widget-ember-component');
Ember.TEMPLATES['components/another-widget'] = require('some-widget-ember-component/index.hbs');
```

Or if you want to extend another component and package it:

``` javascript
// node_modules/enhanced-widget-ember-component/index.js
module.exports = require('some-widget-ember-component').extend({
  classNames: ['enhanced-widget']
});
```

Hooray! Shareable, nested, auto-resolving Ember components!

## Release History
* 0.2.0 - handle nested components, update API
* 0.1.0 - initial release

## License
Copyright (c) 2013 Kyle Robinson Young  
Licensed under the MIT license.
