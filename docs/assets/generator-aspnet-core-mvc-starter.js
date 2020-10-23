var APPLICATION_CSHTML_TEMPLATE = document.getElementById('template__application-cshtml').value;
var VIEWSTART_CSHTML_TEMPLATE = document.getElementById('template__viewstart-cshtml').value;
var LAYOUT_NAVBAR_CSHTML_TEMPLATE = document.getElementById('template__layout-navbar-cshtml').value;
var LAYOUT_SIDENAV_CSHTML_TEMPLATE = document.getElementById('template__layout-sidenav-cshtml').value;
var LAYOUT_FOOTER_CSHTML_TEMPLATE = document.getElementById('template__layout-footer-cshtml').value;

new Vue({
  el: '#generator-aspnet-core-mvc',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        paceLoader: false,
      },

      originalContent: {
        'AspnetCoreMvcStarter/Views/Shared/Layouts/_Application.cshtml': '',
        'AspnetCoreMvcStarter/Views/_ViewStart.cshtml': '',
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml': '',
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml': '',
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml': '',
      },
      tabContent: {
        'AspnetCoreMvcStarter/Views/Shared/Layouts/_Application.cshtml': '',
        'AspnetCoreMvcStarter/Views/_ViewStart.cshtml': '',
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml': '',
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml': '',
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml': '',
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
        'AspnetCoreMvcStarter/Views/Shared/Layouts/_Application.cshtml': { template: APPLICATION_CSHTML_TEMPLATE },
        'AspnetCoreMvcStarter/Views/_ViewStart.cshtml': { template: VIEWSTART_CSHTML_TEMPLATE, context: viewStartContext },
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml': { template: LAYOUT_NAVBAR_CSHTML_TEMPLATE },
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml': { template: LAYOUT_SIDENAV_CSHTML_TEMPLATE },
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml': { template: LAYOUT_FOOTER_CSHTML_TEMPLATE },
      }, this.options);

      this.tabContent = {
        'AspnetCoreMvcStarter/Views/Shared/Layouts/_Application.cshtml': generatorHighlight(this.originalContent['AspnetCoreMvcStarter/Views/Shared/Layouts/_Application.cshtml']),
        'AspnetCoreMvcStarter/Views/_ViewStart.cshtml': generatorHighlight(this.originalContent['AspnetCoreMvcStarter/Views/_ViewStart.cshtml']),
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml': generatorHighlight(this.originalContent['AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutNavbar.cshtml']),
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml': generatorHighlight(this.originalContent['AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutSidenav.cshtml']),
        'AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml': generatorHighlight(this.originalContent['AspnetCoreMvcStarter/Views/Shared/Layouts/Partials/_LayoutFooter.cshtml']),
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
