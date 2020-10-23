var INDEX_HTML_TEMPLATE = document.getElementById('template__index-html').value;
var ANGULAR_JSON_TEMPLATE = document.getElementById('template__angular-json').value;
var APP_COMONENT_TS_TEMPLATE = document.getElementById('template__app-component-ts').value;
var APP_MODULE_TS_TEMPLATE = document.getElementById('template__app-module-ts').value;
var APP_SERVICE_TS_TEMPLATE = document.getElementById('template__app-service-ts').value;
var APP_ROUTING_MODULE_TS_TEMPLATE = document.getElementById('template__app-routing-module-ts').value;

new Vue({
  el: '#generator-angular',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        splashScreen: false,
      },

      originalContent: {
        'angular.json': '',
        'src/index.html': '',
        'src/app/app.component.ts': '',
        'src/app/app-routing.module.ts': '',
        'src/app/app.service.ts': '',
        'src/app/app.module.ts': ''
      },
      tabContent: {
        'angular.json': '',
        'src/index.html': '',
        'src/app/app.component.ts': '',
        'src/app/app-routing.module.ts': '',
        'src/app/app.service.ts': '',
        'src/app/app.module.ts': ''
      },
    };
  },
  methods: {
    generate: function() {
      var routingContext = {
        prefixLayout: function(l) {
          return l.indexOf('layout') !== -1 ? l : 'layout-' + l;
        },
        layoutClass: function(l) {
          return 'Layout' + l.replace('layout-', '').replace(/^(.)/g, function(m, $1) {
            return $1.toUpperCase();
          }).replace(/-(.)/g, function(m, $1) {
            return $1.toUpperCase();
          }) + 'Component'
        }
      };

      this.originalContent = generatorParse({
        'angular.json': { template: ANGULAR_JSON_TEMPLATE },
        'src/index.html': { template: INDEX_HTML_TEMPLATE },
        'src/app/app.component.ts': { template: APP_COMONENT_TS_TEMPLATE },
        'src/app/app-routing.module.ts': { template: APP_ROUTING_MODULE_TS_TEMPLATE, context: routingContext },
        'src/app/app.service.ts': { template: APP_SERVICE_TS_TEMPLATE },
        'src/app/app.module.ts': { template: APP_MODULE_TS_TEMPLATE }
      }, this.options);

      this.tabContent = {
        'angular.json': generatorHighlight(this.originalContent['angular.json'], 'json'),
        'src/index.html': generatorHighlight(this.originalContent['src/index.html']),
        'src/app/app.component.ts': generatorHighlight(this.originalContent['src/app/app.component.ts'], 'typescript'),
        'src/app/app-routing.module.ts': generatorHighlight(this.originalContent['src/app/app-routing.module.ts'], 'typescript'),
        'src/app/app.service.ts': generatorHighlight(this.originalContent['src/app/app.service.ts'], 'typescript'),
        'src/app/app.module.ts': generatorHighlight(this.originalContent['src/app/app.module.ts'], 'typescript')
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
