module.exports = ->

  @registerTask 'default', ['clean', 'copy', 'webpack']
  @registerTask 'start', ['default', 'connect', 'watch']
  @registerTask 'test', ['default', 'connect', 'qunit']

  @initConfig
    dist: 'tmp/'

    webpack: test:
      entry: './test/app.js'
      output:
        path: './<%= dist %>'
        filename: 'app.js'
      resolve:
        modulesDirectories: ['node_modules', 'bower_components']
      module:
        loaders: [
          test: /\.hbs$/
          loader: 'ember-templates-loader'
        ]

    clean:
      tmp: '<%= dist %>'

    copy:
      '<%= dist %>index.html': 'test/index.html'

    connect: server: options:
      base: '<%= dist %>'

    qunit: test: options: urls: ['http://localhost:8000/index.html']

    watch:
      test:
        options: livereload: true, spawn: false
        files: ['index.js', 'test/**/*']
        tasks: 'default'

  # load npm installed tasks
  @loadNpmTasks(task) for task in require('matchdep').filterDev(['grunt-*', '!grunt-cli'])
