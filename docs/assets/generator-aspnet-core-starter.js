var APPLICATION_CSHTML_TEMPLATE = document.getElementById('template__application-cshtml').value;
var VIEWSTART_CSHTML_TEMPLATE = document.getElementById('template__viewstart-cshtml').value;
var LAYOUT_NAVBAR_CSHTML_TEMPLATE = document.getElementById('template__layout-navbar-cshtml').value;
var LAYOUT_SIDENAV_CSHTML_TEMPLATE = document.getElementById('template__layout-sidenav-cshtml').value;
var LAYOUT_FOOTER_CSHTML_TEMPLATE = document.getElementById('template__layout-footer-cshtml').value;

new Vue({
  el: '#generator-aspnet-core',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        paceLoader: false,
      },

      originalContent: {
        'AspnetCoreStarter/Pages/Layouts/_Application.cshtml': '',
        'AspnetCoreStarter/Pages/_ViewStart.cshtml': '',
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutNavbar.cshtml': '',
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutSidenav.cshtml': '',
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutFooter.cshtml': '',
      },
      tabContent: {
        'AspnetCoreStarter/Pages/Layouts/_Application.cshtml': '',
        'AspnetCoreStarter/Pages/_ViewStart.cshtml': '',
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutNavbar.cshtml': '',
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutSidenav.cshtml': '',
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutFooter.cshtml': '',
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
        'AspnetCoreStarter/Pages/Layouts/_Application.cshtml': { template: APPLICATION_CSHTML_TEMPLATE },
        'AspnetCoreStarter/Pages/_ViewStart.cshtml': { template: VIEWSTART_CSHTML_TEMPLATE, context: viewStartContext },
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutNavbar.cshtml': { template: LAYOUT_NAVBAR_CSHTML_TEMPLATE },
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutSidenav.cshtml': { template: LAYOUT_SIDENAV_CSHTML_TEMPLATE },
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutFooter.cshtml': { template: LAYOUT_FOOTER_CSHTML_TEMPLATE },
      }, this.options);

      this.tabContent = {
        'AspnetCoreStarter/Pages/Layouts/_Application.cshtml': generatorHighlight(this.originalContent['AspnetCoreStarter/Pages/Layouts/_Application.cshtml']),
        'AspnetCoreStarter/Pages/_ViewStart.cshtml': generatorHighlight(this.originalContent['AspnetCoreStarter/Pages/_ViewStart.cshtml']),
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutNavbar.cshtml': generatorHighlight(this.originalContent['AspnetCoreStarter/Pages/Layouts/Partials/_LayoutNavbar.cshtml']),
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutSidenav.cshtml': generatorHighlight(this.originalContent['AspnetCoreStarter/Pages/Layouts/Partials/_LayoutSidenav.cshtml']),
        'AspnetCoreStarter/Pages/Layouts/Partials/_LayoutFooter.cshtml': generatorHighlight(this.originalContent['AspnetCoreStarter/Pages/Layouts/Partials/_LayoutFooter.cshtml']),
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
