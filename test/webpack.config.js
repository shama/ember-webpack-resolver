module.exports = {
  context: __dirname,
  entry: 'mocha-loader!./all.js',
  resolve: {
    modulesDirectories: ['node_modules', 'bower_components']
  }
};