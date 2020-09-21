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

  // Convert has array to index for faster lookups
  var hasIndex = Object.create(null);
  var useHasIndex = false;
  if (Array.isArray(options.has)) {
    useHasIndex = true;
    for (var i = 0; i < options.has.length; i++) {
      hasIndex[options.has[i]] = 1;
    }
  }

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

  function getToStringFunction(type, fullNameWithoutType) {
    return function () {
      type = Ember.String.classify(type);
      if (type === 'Model') type = '';
      return 'App.' + Ember.String.classify(fullNameWithoutType + type);
    }
  }

  function resolveOther(parsedName) {
    if (!parsedName.name || !parsedName.type) {
      return this._super.apply(this, arguments);
    }

    var factory;
    var moduleName = false;
    // Add variations for Ember pod-like structure
    var podVariation = options.modulePrefix + parsedName.fullNameWithoutType + '/' + parsedName.type;
    var withinComponentPodVariation = options.modulePrefix + parsedName.type + 's/' + parsedName.fullNameWithoutType + '/' + parsedName.type;
    if (parsedName.type === 'template' && parsedName.fullNameWithoutType.slice(0, 11) === 'components/') {
      podVariation = options.modulePrefix + parsedName.fullNameWithoutType.slice(11) + '/' + parsedName.type;
      withinComponentPodVariation = options.modulePrefix + 'components/' + parsedName.fullNameWithoutType.slice(11) + '/' + parsedName.type;
    }
    var variations = [
      podVariation,
      options.modulePrefix + parsedName.type + 's/' + parsedName.fullNameWithoutType,
      withinComponentPodVariation
    ];
    var contextrequire = options.context;

    if (useHasIndex) {
      dance:
      for (var i = 0; i < variations.length; i++) {
        // Try without an extension first
        if (hasIndex[variations[i]]) {
          moduleName = variations[i];
          break;
        }
        // Now try extension variations
        for (var j = 0; j < options.extensions.length; j++) {
          if (hasIndex[variations[i] + options.extensions[j]]) {
            moduleName = variations[i] + options.extensions[j];
            break dance;
          }
        }
      }
    } else {
      moduleName = options.modulePrefix + parsedName.type + 's/' + parsedName.fullNameWithoutType;
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
            if (typeof result === 'string') {
              moduleName = result;
            } else {
              factory = result;
              moduleName = true;
            }
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

    // If using `export default`
    if (factory && factory['default']) {
      factory = factory['default'];
    }

    // To fix class introspection
    if (options.fixToString) {
      var className = factory.toString();
      if (className.indexOf('(') !== -1 || className === "@ember/component") {
        factory.toString = getToStringFunction(parsedName.type, parsedName.fullNameWithoutType);
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
        var context = options.context(name);
        var isModule = typeof context === "object" && typeof context.default === "function";
        return isModule ? context.default : context;
      }
    }
  }

  return Ember.DefaultResolver.extend({
    resolveOther: resolveOther,
    resolveTemplate: resolveOther, // TODO: Check Ember.TEMPLATES as backup
    resolveRouter: resolveRouter,
    parseName: parseName,
    makeToString: function(factory, fullName) {
        return '' + options.modulePrefix + '@' + fullName + ':';
    },
    normalize: function(fullName) {
      // replace `.` with `/` in order to make nested controllers work in the following cases
      // 1. `needs: ['posts/post']`
      // 2. `{{render 'posts/post'}}`
      // 3. `this.render('posts/post')` from Route
      return Ember.String.dasherize(fullName.replace(/\./g, '/'));
    }
  });
};
