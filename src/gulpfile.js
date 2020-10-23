const path = require('path')

// -------------------------------------------------------------------------------
// Config

const env = require('gulp-environment')

process.env.NODE_ENV = env.current.name

const conf = (() => {
  const _conf = require('./build-config')
  return require('deepmerge').all([{}, _conf.base || {}, _conf[process.env.NODE_ENV] || {}])
})()

conf.buildPath = path.resolve(__dirname, conf.buildPath).replace(/\\/g, '/')

// -------------------------------------------------------------------------------
// Modules

const { src, dest, parallel, series, watch } = require('gulp')
const webpack = require('webpack')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const gulpIf = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const colors = require('ansi-colors')
const log = require('fancy-log')

colors.enabled = require('color-support').hasBasic

// -------------------------------------------------------------------------------
// Utilities

function normalize(p) {
  return p.replace(/\\/g, '/')
}

function root(p) {
  return p.startsWith('!') ?
    normalize(`!${path.join(__dirname, p.slice(1))}`) :
    normalize(path.join(__dirname, p))
}

function getSrc(...src) {
  return src.map(p => root(p)).concat(conf.exclude.map(d => `!${root(d)}/**/*`))
}

// -------------------------------------------------------------------------------
// Clean build directory

const cleanTask = function () {
  return del([conf.buildPath], {
    force: true
  })
}

// -------------------------------------------------------------------------------
// Build css

const buildCssTask = function () {
  return src(getSrc('**/*.scss', '!**/_*.scss'), { base: root('.') })

    .pipe(gulpIf(conf.sourcemaps, sourcemaps.init()))
    .pipe(sass({
      outputStyle: conf.minify ? 'compressed' : 'nested'
    }).on('error', sass.logError))
    .pipe(gulpIf(conf.sourcemaps, sourcemaps.write()))

    .pipe(gulpIf(conf.sourcemaps, sourcemaps.init({
      loadMaps: true
    })))
    .pipe(autoprefixer({
      overrideBrowserslist: [
        '>= 1%',
        'last 2 versions',
        'not dead',
        'Chrome >= 45',
        'Firefox >= 38',
        'Edge >= 12',
        'Explorer >= 10',
        'iOS >= 9',
        'Safari >= 9',
        'Android >= 4.4',
        'Opera >= 30'
      ]
    }))
    .pipe(gulpIf(conf.sourcemaps, sourcemaps.write()))

    .pipe(dest(conf.buildPath))
}

// -------------------------------------------------------------------------------
// Build js

const buildJsTask = function (cb) {
  setTimeout(function () {
    webpack(require('./webpack.config'), (err, stats) => {
      if (err) {
        log(colors.gray('Webpack error:'), colors.red(err.stack || err))
        if (err.details) log(colors.gray('Webpack error details:'), err.details)
        return cb()
      }

      const info = stats.toJson()

      if (stats.hasErrors()) {
        info.errors.forEach(e => log(colors.gray('Webpack compilation error:'), colors.red(e)))
      }

      if (stats.hasWarnings()) {
        info.warnings.forEach(w => log(colors.gray('Webpack compilation warning:'), colors.yellow(w)))
      }

      // Print log
      log(stats.toString({
        colors: colors.enabled,
        hash: false,
        timings: false,
        chunks: false,
        chunkModules: false,
        modules: false,
        children: true,
        version: true,
        cached: false,
        cachedAssets: false,
        reasons: false,
        source: false,
        errorDetails: false
      }))

      cb()
    })
  }, 1)
}

// -------------------------------------------------------------------------------
// Build fonts

const FONT_TASKS = [{
    name: 'fontawesome',
    path: 'node_modules/@fortawesome/fontawesome-free/webfonts/*'
  },
  {
    name: 'linearicons',
    path: 'node_modules/linearicons/dist/web-font/fonts/*'
  },
  {
    name: 'pe-icon-7-stroke',
    path: 'node_modules/pixeden-stroke-7-icon/pe-icon-7-stroke/fonts/*'
  },
  {
    name: 'open-iconic',
    path: 'node_modules/open-iconic/font/fonts/*'
  },
  {
    name: 'ionicons',
    path: 'node_modules/ionicons/dist/fonts/*'
  }
].reduce(function (tasks, font) {
  const functionName = `buildFonts${font.name.replace(/^./, m => m.toUpperCase())}Task`
  const taskFunction = function () {
    return src(root(font.path))
      .pipe(dest(normalize(path.join(conf.buildPath, 'fonts', font.name))))
  }

  Object.defineProperty(taskFunction, 'name', {
    value: functionName
  });

  return tasks.concat([taskFunction])
}, [])

// Copy linearicons' style.css
FONT_TASKS.push(function buildFontsLinearicons () {
  return src(root('node_modules/linearicons/dist/web-font/style.css'))
    .pipe(replace(/'fonts\//g, '\'linearicons/'))
    .pipe(rename({
      basename: 'linearicons'
    }))
    .pipe(dest(normalize(path.join(conf.buildPath, 'fonts'))))
})

const buildFontsTask = parallel(FONT_TASKS)

// -------------------------------------------------------------------------------
// Copy

const buildCopyTask = function () {
  return src(getSrc('**/*.png', '**/*.gif', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.swf', '**/*.eot', '**/*.ttf', '**/*.woff', '**/*.woff2'), {
    base: root('.')
  })
  .pipe(dest(conf.buildPath))
}

// -------------------------------------------------------------------------------
// Watch

const watchTask = function () {
  watch(getSrc('**/*.scss', '!fonts/**/*.scss'), buildCssTask)
  watch(getSrc('fonts/**/*.scss'), parallel(buildCssTask, buildFontsTask))
  watch(getSrc('**/*.@(js|es6)', '!*.js'), buildJsTask)
  watch(getSrc('**/*.png', '**/*.gif', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.swf'), buildCopyTask)
}

// -------------------------------------------------------------------------------
// Build

const buildTasks = [
  buildCssTask,
  buildJsTask,
  buildFontsTask,
  buildCopyTask
]

const buildTask = conf.cleanBuild ?
  series(cleanTask, parallel(buildTasks)) :
  parallel(buildTasks)

// -------------------------------------------------------------------------------
// Exports

module.exports = {
  default: buildTask,
  build: buildTask,
  'build:js': buildJsTask,
  'build:css': buildCssTask,
  'build:fonts': buildFontsTask,
  'build:copy': buildCopyTask,
  watch: watchTask
}
