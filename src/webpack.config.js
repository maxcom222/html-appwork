const path = require('path')
const glob = require('glob')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// -------------------------------------------------------------------------------
// Config

const conf = (() => {
  const _conf = require('./build-config')
  return require('deepmerge').all([{}, _conf.base || {}, _conf[process.env.NODE_ENV] || {}])
})()

conf.buildPath = path.resolve(__dirname, conf.buildPath)

// -------------------------------------------------------------------------------
// NPM packages to transpile

const TRANSPILE_PACKAGES = [
  'bootstrap',
  'bootstrap-slider',
  'popper.js',
  'bootstrap-table',
  'shepherd.js',
  'flot',
]

const packageRejex = package => `(?:\\\\|\\/)${package}(?:\\\\|\\/).+?\\.js$`

// -------------------------------------------------------------------------------
// Build config

const collectEntries = () => {
  const fileList = glob.sync(`!(${conf.exclude.join('|')})/**/!(_)*.@(js|es6)`) || []
  return fileList.reduce((entries, file) => {
    const filePath = file.replace(/\\/g, '/')
    return { ...entries, [filePath.replace(/\.(?:js|es6)$/, '')]: `./${filePath}` }
  }, {})
}

const babelLoader = () => ({
  loader: 'babel-loader',
  options: {
    presets: [['@babel/preset-env', { targets: 'last 2 versions, ie >= 10' }]],
    plugins: ['@babel/plugin-transform-destructuring', '@babel/plugin-proposal-object-rest-spread', '@babel/plugin-transform-template-literals'],
    babelrc: false
  }
})

const webpackConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: collectEntries(),

  output: {
    path: conf.buildPath,
    filename: '[name].js',
    libraryTarget: 'window'
  },

  module: {
    rules: [{
      // Transpile sources
      test: /\.es6$|\.js$/,
      exclude: [path.resolve(__dirname, 'node_modules')],
      use: [babelLoader()]
    }, {
      // Pranspile required packages
      test: new RegExp(`(?:${TRANSPILE_PACKAGES.map(packageRejex).join(')|(?:')})`),
      include: [path.resolve(__dirname, 'node_modules')],
      use: [babelLoader()]
    }, {
      test: /\.css$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' }
      ]
    }, {
      test: /\.scss$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        { loader: 'sass-loader' }
      ]
    }, {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: { minimize: true }
      }]
    }]
  },

  externals: {
    'jquery': 'jQuery',
    'moment': 'moment',
    'datatables.net': '$.fn.dataTable',
    'spin.js': 'Spinner',
    'jsdom': 'jsdom',
    'd3': 'd3',
    'eve': 'eve',
    'velocity': 'Velocity',
    'hammer': 'Hammer',
    'raphael': 'Raphael',
    'jquery-mapael': 'Mapael',
    'pace': '"pace-progress"',
    'popper.js': 'Popper',
    'jquery-validation': 'jQuery',

    // blueimp-file-upload plugin
    'canvas-to-blob': 'blueimpDataURLtoBlob',
    'blueimp-tmpl': 'blueimpTmpl',
    'load-image': 'blueimpLoadImage',
    'load-image-meta': 'null',
    'load-image-scale': 'null',
    'load-image-exif': 'null',
    'jquery-ui/ui/widget': 'null',
    './jquery.fileupload': 'null',
    './jquery.fileupload-process': 'null',
    './jquery.fileupload-image': 'null',
    './jquery.fileupload-video': 'null',
    './jquery.fileupload-validate': 'null',

    // blueimp-gallery plugin
    './blueimp-helper': 'jQuery',
    './blueimp-gallery': 'blueimpGallery',
    './blueimp-gallery-video': 'blueimpGallery'
  }
}

// -------------------------------------------------------------------------------
// Sourcemaps

if (conf.sourcemaps) {
  webpackConfig.devtool = conf.devtool
}

// -------------------------------------------------------------------------------
// Minify

// Minifies sources by default in production mode
if (process.env.NODE_ENV !== 'production' && conf.minify) {
  webpackConfig.plugins.push(
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: conf.sourcemaps,
      parallel: true
    })
  )
}

module.exports = webpackConfig
