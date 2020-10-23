var INDEX_HTML_TEMPLATE = document.getElementById('template__index-html').value;
var ROUTES_JS_TEMPLATE = document.getElementById('template__routes-js').value;
var APP_JS_TEMPLATE = document.getElementById('template__app-js').value;
var THEME_STORE_JS_TEMPLATE = document.getElementById('template__theme-store-js').value;

new Vue({
  el: '#generator-react',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        splashScreen: false,
      },

      originalContent: {
        'public/index.html': '',
        'src/routes.js': '',
        'src/App.js': '',
        'src/store/reducers/themeStore.js': '',
      },
      tabContent: {
        'public/index.html': '',
        'src/routes.js': '',
        'src/App.js': '',
        'src/store/reducers/themeStore.js': '',
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
        'public/index.html': { template: INDEX_HTML_TEMPLATE },
        'src/routes.js': { template: ROUTES_JS_TEMPLATE, context: routingContext },
        'src/App.js': { template: APP_JS_TEMPLATE },
        'src/store/reducers/themeStore.js': { template: THEME_STORE_JS_TEMPLATE },
      }, this.options);

      this.tabContent = {
        'public/index.html': generatorHighlight(this.originalContent['public/index.html']),
        'src/routes.js': generatorHighlight(this.originalContent['src/routes.js'], 'javascript'),
        'src/App.js': generatorHighlight(this.originalContent['src/App.js'], 'javascript'),
        'src/store/reducers/themeStore.js': generatorHighlight(this.originalContent['src/store/reducers/themeStore.js'], 'javascript'),
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
