var WEBPACK_MIX_JS_TEMPLATE = document.getElementById('template__webpack-mix-js').value;
var APPLICATION_BLADE_PHP_TEMPLATE = document.getElementById('template__application-blade-php').value;
var HOME_BLADE_PHP_TEMPLATE = document.getElementById('template__home-blade-php').value;
var PAGE2_BLADE_PHP_TEMPLATE = document.getElementById('template__page-2-blade-php').value;
var LAYOUT_NAVBAR_BLADE_PHP_TEMPLATE = document.getElementById('template__layout-navbar-blade-php').value;
var LAYOUT_SIDENAV_BLADE_PHP_TEMPLATE = document.getElementById('template__layout-sidenav-blade-php').value;
var LAYOUT_FOOTER_BLADE_PHP_TEMPLATE = document.getElementById('template__layout-footer-blade-php').value;

new Vue({
  el: '#generator-laravel',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        paceLoader: false,
      },

      originalContent: {
        'webpack.mix.js': '',
        'resources/views/layouts/application.blade.php': '',
        'resources/views/home.blade.php': '',
        'resources/views/page-2.blade.php': '',
        'resources/views/layouts/includes/layout-navbar.blade.php': '',
        'resources/views/layouts/includes/layout-sidenav.blade.php': '',
        'resources/views/layouts/includes/layout-footer.blade.php': '',
      },
      tabContent: {
        'webpack.mix.js': '',
        'resources/views/layouts/application.blade.php': '',
        'resources/views/home.blade.php': '',
        'resources/views/page-2.blade.php': '',
        'resources/views/layouts/includes/layout-navbar.blade.php': '',
        'resources/views/layouts/includes/layout-sidenav.blade.php': '',
        'resources/views/layouts/includes/layout-footer.blade.php': '',
      },
    };
  },
  methods: {
    generate: function() {
      this.originalContent = generatorParse({
        'webpack.mix.js': { template: WEBPACK_MIX_JS_TEMPLATE },
        'resources/views/layouts/application.blade.php': { template: APPLICATION_BLADE_PHP_TEMPLATE },
        'resources/views/home.blade.php': { template: HOME_BLADE_PHP_TEMPLATE },
        'resources/views/page-2.blade.php': { template: PAGE2_BLADE_PHP_TEMPLATE },
        'resources/views/layouts/includes/layout-navbar.blade.php': { template: LAYOUT_NAVBAR_BLADE_PHP_TEMPLATE },
        'resources/views/layouts/includes/layout-sidenav.blade.php': { template: LAYOUT_SIDENAV_BLADE_PHP_TEMPLATE },
        'resources/views/layouts/includes/layout-footer.blade.php': { template: LAYOUT_FOOTER_BLADE_PHP_TEMPLATE },
      }, this.options);

      this.tabContent = {
        'webpack.mix.js': generatorHighlight(this.originalContent['webpack.mix.js'], 'javascript'),
        'resources/views/layouts/application.blade.php': generatorHighlight(this.originalContent['resources/views/layouts/application.blade.php']),
        'resources/views/home.blade.php': generatorHighlight(this.originalContent['resources/views/home.blade.php']),
        'resources/views/page-2.blade.php': generatorHighlight(this.originalContent['resources/views/page-2.blade.php']),
        'resources/views/layouts/includes/layout-navbar.blade.php': generatorHighlight(this.originalContent['resources/views/layouts/includes/layout-navbar.blade.php']),
        'resources/views/layouts/includes/layout-sidenav.blade.php': generatorHighlight(this.originalContent['resources/views/layouts/includes/layout-sidenav.blade.php']),
        'resources/views/layouts/includes/layout-footer.blade.php': generatorHighlight(this.originalContent['resources/views/layouts/includes/layout-footer.blade.php']),
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
