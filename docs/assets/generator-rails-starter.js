var APPLICATION_HTML_TEMPLATE = document.getElementById('template__application-html').value;
var APPLICATION_CONTROLLER_RB_TEMPLATE = document.getElementById('template__application_controller-rb').value;
var LAYOUT_NAVBAR_HTML_TEMPLATE = document.getElementById('template__layout-navbar-html').value;
var LAYOUT_SIDENAV_HTML_TEMPLATE = document.getElementById('template__layout-sidenav-html').value;
var LAYOUT_FOOTER_HTML_TEMPLATE = document.getElementById('template__layout-footer-html').value;

new Vue({
  el: '#generator-rails',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        paceLoader: false,
      },

      originalContent: {
        'app/views/layouts/application.html.erb': '',
        'app/controllers/application_controller.rb': '',
        'app/views/layouts/partials/_layout-navbar.html.erb': '',
        'app/views/layouts/partials/_layout-sidenav.html.erb': '',
        'app/views/layouts/partials/_layout-footer.html.erb': '',
      },
      tabContent: {
        'app/views/layouts/application.html.erb': '',
        'app/views/layouts/application.html.erb': '',
        'app/controllers/application_controller.rb': '',
        'app/views/layouts/partials/_layout-navbar.html.erb': '',
        'app/views/layouts/partials/_layout-sidenav.html.erb': '',
        'app/views/layouts/partials/_layout-footer.html.erb': '',
      },
    };
  },
  methods: {
    generate: function() {
      this.originalContent = generatorParse({
        'app/views/layouts/application.html.erb': { template: APPLICATION_HTML_TEMPLATE },
        'app/controllers/application_controller.rb': { template: APPLICATION_CONTROLLER_RB_TEMPLATE },
        'app/views/layouts/partials/_layout-navbar.html.erb': { template: LAYOUT_NAVBAR_HTML_TEMPLATE },
        'app/views/layouts/partials/_layout-sidenav.html.erb': { template: LAYOUT_SIDENAV_HTML_TEMPLATE },
        'app/views/layouts/partials/_layout-footer.html.erb': { template: LAYOUT_FOOTER_HTML_TEMPLATE },
      }, this.options);

      this.tabContent = {
        'app/views/layouts/application.html.erb': generatorHighlight(this.originalContent['app/views/layouts/application.html.erb']),
        'app/controllers/application_controller.rb': generatorHighlight(this.originalContent['app/controllers/application_controller.rb'], 'ruby'),
        'app/views/layouts/partials/_layout-navbar.html.erb': generatorHighlight(this.originalContent['app/views/layouts/partials/_layout-navbar.html.erb']),
        'app/views/layouts/partials/_layout-sidenav.html.erb': generatorHighlight(this.originalContent['app/views/layouts/partials/_layout-sidenav.html.erb']),
        'app/views/layouts/partials/_layout-footer.html.erb': generatorHighlight(this.originalContent['app/views/layouts/partials/_layout-footer.html.erb']),
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
