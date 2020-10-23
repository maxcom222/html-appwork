var BUNDLECONFIG_CS_TEMPLATE = document.getElementById('template__bundleconfig-cs').value;
var APPLICATION_CSHTML_TEMPLATE = document.getElementById('template__application-cshtml').value;
var VIEWSTART_CSHTML_TEMPLATE = document.getElementById('template__viewstart-cshtml').value;
var LAYOUT_NAVBAR_CSHTML_TEMPLATE = document.getElementById('template__layout-navbar-cshtml').value;
var LAYOUT_SIDENAV_CSHTML_TEMPLATE = document.getElementById('template__layout-sidenav-cshtml').value;
var LAYOUT_FOOTER_CSHTML_TEMPLATE = document.getElementById('template__layout-footer-cshtml').value;

new Vue({
  el: '#generator-aspnet-mvc',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        paceLoader: false,
      },

      originalContent: {
        'AspnetMvcStarter/App_Start/BundleConfig.cs': '',
        'AspnetMvcStarter/Views/Shared/Layouts/_Application.cshtml': '',
        'AspnetMvcStarter/Views/_ViewStart.cshtml': '',
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml': '',
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml': '',
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml': '',
      },
      tabContent: {
        'AspnetMvcStarter/App_Start/BundleConfig.cs': '',
        'AspnetMvcStarter/Views/Shared/Layouts/_Application.cshtml': '',
        'AspnetMvcStarter/Views/_ViewStart.cshtml': '',
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml': '',
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml': '',
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml': '',
      },
    };
  },
  methods: {
    generate: function() {
      var viewStartContext = {
        layoutClass: function(l) {
          return 'Layout' + l.replace('layout-', '').replace(/^(.)/g, function(m, $1) {
            return $1.toUpperCase();
          }).replace(/-(.)/g, function(m, $1) {
            return $1.toUpperCase();
          });
        }
      };

      this.originalContent = generatorParse({
        'AspnetMvcStarter/App_Start/BundleConfig.cs': { template: BUNDLECONFIG_CS_TEMPLATE },
        'AspnetMvcStarter/Views/Shared/Layouts/_Application.cshtml': { template: APPLICATION_CSHTML_TEMPLATE },
        'AspnetMvcStarter/Views/_ViewStart.cshtml': { template: VIEWSTART_CSHTML_TEMPLATE, context: viewStartContext },
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml': { template: LAYOUT_NAVBAR_CSHTML_TEMPLATE },
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml': { template: LAYOUT_SIDENAV_CSHTML_TEMPLATE },
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml': { template: LAYOUT_FOOTER_CSHTML_TEMPLATE },
      }, this.options);

      this.tabContent = {
        'AspnetMvcStarter/App_Start/BundleConfig.cs': generatorHighlight(this.originalContent['AspnetMvcStarter/App_Start/BundleConfig.cs'], 'cs'),
        'AspnetMvcStarter/Views/Shared/Layouts/_Application.cshtml': generatorHighlight(this.originalContent['AspnetMvcStarter/Views/Shared/Layouts/_Application.cshtml']),
        'AspnetMvcStarter/Views/_ViewStart.cshtml': generatorHighlight(this.originalContent['AspnetMvcStarter/Views/_ViewStart.cshtml']),
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml': generatorHighlight(this.originalContent['AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml']),
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml': generatorHighlight(this.originalContent['AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml']),
        'AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml': generatorHighlight(this.originalContent['AspnetMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml']),
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
