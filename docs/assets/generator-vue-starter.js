var VUE_CONFIG_JS_TEMPLATE = document.getElementById('template__vue-config-js').value;
var INDEX_HTML_TEMPLATE = document.getElementById('template__index-html').value;
var GLOBALS_JS_TEMPLATE = document.getElementById('template__globals-js').value;
var ROUTER_TEMPLATE = document.getElementById('template__router').value;
var APP_VUE_TEMPLATE = document.getElementById('template__app-vue').value;

new Vue({
  el: '#generator-vue',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        splashScreen: false,
      },

      originalContent: {
        'vue.config.js': '',
        'public/index.html': '',
        'src/router/index.js': '',
        'src/App.vue': '',
        'src/globals.js': '',
      },
      tabContent: {
        'vue.config.js': '',
        'public/index.html': '',
        'src/router/index.js': '',
        'src/App.vue': '',
        'src/globals.js': '',
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
        'vue.config.js': { template: VUE_CONFIG_JS_TEMPLATE },
        'public/index.html': { template: INDEX_HTML_TEMPLATE },
        'src/router/index.js': { template: ROUTER_TEMPLATE, context: routingContext },
        'src/App.vue': { template: APP_VUE_TEMPLATE },
        'src/globals.js': { template: GLOBALS_JS_TEMPLATE },
      }, this.options);

      this.tabContent = {
        'vue.config.js': generatorHighlight(this.originalContent['vue.config.js'], 'javascript'),
        'public/index.html': generatorHighlight(this.originalContent['public/index.html']),
        'src/router/index.js': generatorHighlight(this.originalContent['src/router/index.js'], 'javascript'),
        'src/App.vue': generatorHighlight(this.originalContent['src/App.vue']),
        'src/globals.js': generatorHighlight(this.originalContent['src/globals.js'], 'javascript'),
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
