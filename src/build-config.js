module.exports = {
  base: {
    // Do not perform lookup in this directories.
    // MUST be relative to `src` directory.
    exclude: [
      'dist',
      'node_modules'
    ]
  },
  development: {
    // Build path can be both relative or absolute.
    buildPath: '../dist',

    // Minify assets.
    minify: false,

    // Generate sourcemaps.
    sourcemaps: false,
    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'eval-source-map',

    // Use this option with caution because it will remove entire output directory.
    // Will affect only and `build` command
    cleanBuild: false
  },
  production: {
    // Build path can be both relative or absolute.
    buildPath: '../dist',

    // Minify assets.
    // Note: Webpack will minify js sources in production mode regardless to this option
    minify: true,

    // Generate sourcemaps.
    sourcemaps: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Use this option with caution because it will remove entire output directory.
    // Will affect only `build:prod` command
    cleanBuild: false
  }
}
