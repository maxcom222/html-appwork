var APPLICATION_BLADE_PHP_TEMPLATE = document.getElementById('template__application-blade-php').value;
var WEBPACK_MIX_JS_TEMPLATE = document.getElementById('template__webpack-mix-js').value;
var GLOBALS_JS_TEMPLATE = document.getElementById('template__globals-js').value;
var ROUTER_TEMPLATE = document.getElementById('template__router').value;
var APP_VUE_TEMPLATE = document.getElementById('template__app-vue').value;

new Vue({
  el: '#generator-laravel-vue',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        splashScreen: false,
      },

      originalContent: {
        'resources/views/application.blade.php': '',
        'webpack.mix.js': '',
        'resources/assets/src/router/index.js': '',
        'resources/assets/src/App.vue': '',
        'resources/assets/src/globals.js': '',
      },
      tabContent: {
        'resources/views/application.blade.php': '',
        'webpack.mix.js': '',
        'resources/assets/src/router/index.js': '',
        'resources/assets/src/App.vue': '',
        'resources/assets/src/globals.js': '',
      },
    };
  },
  methods: {
    generate: function() {
      var routingContext = {
        layoutClass: function(l) {
          return 'Layout' + l.replace('layout-', '').replace(/^(.)/g, function(m, $1) {
            return $1.toUpperCase();
          }).replace(/-(.)/g, function(m, $1) {
            return $1.toUpperCase();
          });
        }
      };

      this.originalContent = generatorParse({
        'resources/views/application.blade.php': { template: APPLICATION_BLADE_PHP_TEMPLATE },
        'webpack.mix.js': { template: WEBPACK_MIX_JS_TEMPLATE },
        'resources/assets/src/router/index.js': { template: ROUTER_TEMPLATE, context: routingContext },
        'resources/assets/src/App.vue': { template: APP_VUE_TEMPLATE },
        'resources/assets/src/globals.js': { template: GLOBALS_JS_TEMPLATE },
      }, this.options);

      this.tabContent = {
        'resources/views/application.blade.php': generatorHighlight(this.originalContent['resources/views/application.blade.php']),
        'webpack.mix.js': generatorHighlight(this.originalContent['webpack.mix.js'], 'javascript'),
        'resources/assets/src/router/index.js': generatorHighlight(this.originalContent['resources/assets/src/router/index.js'], 'javascript'),
        'resources/assets/src/App.vue': generatorHighlight(this.originalContent['resources/assets/src/App.vue']),
        'resources/assets/src/globals.js': generatorHighlight(this.originalContent['resources/assets/src/globals.js'], 'javascript'),
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
