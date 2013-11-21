module.exports = function(options) {
  options = options || {};

  // Automatically set context if require('ember-webpack-resolver?' + __dirname)
  if (__resourceQuery && !options.context) {
    options.context = require.context(__resourceQuery.substr(1));
  }

  options.modulePrefix = options.modulePrefix || './';
  options.extensions = options.extensions || ['.js', '.hbs'];
  options.fixToString = options.fixToString !== false;
  options.has = options.has || options.context.keys();

  // Find modules in map for dynamic context requires
  function findInMap(parsedName, callback) {
    if (!options[parsedName.type]) return false;
    var map = options[parsedName.type];
    if (!Array.isArray(map)) map = [map];
    for (var i = 0; i < map.length; i++) {
      var context = map[i].context;
      var find = './' + Ember.String.fmt(map[i].format, [parsedName.fullNameWithoutType]);
      var keys = context.keys();
      if (keys.indexOf(find) !== -1) {
        return callback(find, context);
      }
    }
    return false;
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

    // If module not found, look in the map
    if (moduleName === false) {
      moduleName = findInMap(parsedName, function(name, context) {
        // Handle module.exports = function(template) {}; module format
        if (parsedName.type === 'component') {
          context = context(name);
          name = 'components/' + parsedName.fullNameWithoutType;
        }
        return [name, context];
      });
      if (moduleName !== false) {
        contextrequire = moduleName[1];
        moduleName = moduleName[0];
      }
    }

    // Module not found, return the parent
    if (moduleName === false) {
      if (Ember.ENV.LOG_MODULE_RESOLVER) {
        Ember.Logger.info('miss', parsedName.fullName);
      }
      return this._super.apply(this, arguments);
    }

    try {
      factory = contextrequire(moduleName);
    } catch (err) {
      if (Ember.ENV.LOG_MODULE_RESOLVER) {
        Ember.Logger.info('miss', moduleName);
      }
      return this._super.apply(this, arguments);
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
      return Ember.String.dasherize(fullName.replace(/\./g, '/'));
    }
  });
};
