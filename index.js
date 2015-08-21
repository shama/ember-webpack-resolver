module.exports = function(options) {
  options = options || {};

  // Automatically set context if require('ember-webpack-resolver?' + __dirname)
  if (__resourceQuery && !options.context) {
    options.context = require.context(__resourceQuery.substr(1), true);
  }

  options.modulePrefix = options.modulePrefix || './';
  options.extensions = options.extensions || ['.js', '.hbs'];
  options.fixToString = options.fixToString !== false;
  options.has = options.has || options.context.keys();
  options.components = options.components || Object.create(null);

  function parseName(fullName) {
    var nameParts = fullName.split(':');
    return {
      fullName: fullName,
      type: nameParts[0],
      fullNameWithoutType:  nameParts[1],
      name:  nameParts[1],
      root: Ember.get(this, 'namespace'),
      resolveMethodName: 'resolve' + Ember.String.classify(nameParts[0])
    };
  }

  function resolveOther(parsedName) {
    if (!parsedName.name || !parsedName.type) {
      return this._super.apply(this, arguments);
    }

    var factory;
    var moduleName = false;
    var variations = [options.modulePrefix + parsedName.type + 's/' + parsedName.fullNameWithoutType];
    var contextrequire = options.context;

    if (Array.isArray(options.has)) {
      for (var i = 0; i < options.extensions.length; i++) {
        variations.push(variations[0] + options.extensions[i]);
      }
      for (var i = 0; i < variations.length; i++) {
        if (options.has.indexOf(variations[i]) !== -1) {
          moduleName = variations[i];
          break;
        }
      }
    } else {
      moduleName = variations[0];
    }

    /**
      A possible array of functions to test for moduleName's based on the provided
      `parsedName`. This allows easy customization of additional module based
      lookup patterns.
    */
    if (Array.isArray(options.lookupPatterns)) {
      for (var i = 0; i < options.lookupPatterns.length; i++) {
        var lookupFn = options.lookupPatterns[i];
        if (typeof lookupFn === 'function') {
          var result = lookupFn(parsedName);
          if (!(result === void 0)) {
            moduleName = result;
          }
        } else {
          throw new Error('Lookup patterns should be functions. Got type "' + typeof lookupFn + '" instead.');
        }
      }
    }

    // If module not found, look if matches a specified component
    if (moduleName === false && parsedName.type === 'component' && options.components[parsedName.fullNameWithoutType]) {
      moduleName = parsedName.fullNameWithoutType;
      factory = options.components[parsedName.fullNameWithoutType];
    }

    // Module not found, return the parent
    if (moduleName === false) {
      if (Ember.ENV.LOG_MODULE_RESOLVER) {
        Ember.Logger.info('miss', parsedName.fullName);
      }
      return this._super.apply(this, arguments);
    }

    if (!factory) {
      try {
        factory = contextrequire(moduleName);
      } catch (err) {
        if (Ember.ENV.LOG_MODULE_RESOLVER) {
          Ember.Logger.info('miss', moduleName);
        }
        return this._super.apply(this, arguments);
      }
    }

    if (factory === undefined) {
      throw new Error(' Expected to find: "' + parsedName.fullName + '" within "' + moduleName + '" but got "undefined". Did you forget to `module.exports` within "' + moduleName + '"?');
    }

    // To fix class introspection
    if (options.fixToString) {
      var className = factory.toString();
      if (className.indexOf('(') !== -1) {
        factory.toString = function() {
          var type = Ember.String.classify(parsedName.type);
          if (type === 'Model') type = '';
          return 'App.' + Ember.String.classify(parsedName.fullNameWithoutType + type);
        };
      }
    }

    if (Ember.ENV.LOG_MODULE_RESOLVER) {
      Ember.Logger.info('hit', moduleName);
    }
    return factory;
  }

  function resolveRouter(parsedName) {
    if (parsedName.fullName === 'router:main') {
      var name = options.modulePrefix + 'router';
      if (options.context.keys().indexOf(name) !== -1) {
        return options.context(name);
      }
    }
  }

  return Ember.DefaultResolver.extend({
    resolveOther: resolveOther,
    resolveTemplate: resolveOther, // TODO: Check Ember.TEMPLATES as backup
    resolveRouter: resolveRouter,
    parseName: parseName,
    normalize: function(fullName) {
      // replace `.` with `/` in order to make nested controllers work in the following cases
      // 1. `needs: ['posts/post']`
      // 2. `{{render 'posts/post'}}`
      // 3. `this.render('posts/post')` from Route
      return fullName.replace(/\./g, '/');
    }
  });
};
