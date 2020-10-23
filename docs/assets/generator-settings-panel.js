var SETTINGS_PANEL_TEMPLATE = document.getElementById('template__settings-panel').value;

// Mock some ThemeSettings prototype methods
ThemeSettings.prototype._loadSettings = function() {
  this.settings.rtl = false;
  this.settings.material = false;
  this.settings.layoutPosition = 'static';
  this.settings.layoutReversed = false;
  this.settings.layoutNavbarFixed = false;
  this.settings.layoutFooterFixed = false;
  this.settings.navbarBg = this.settings.defaultNavbarBg;
  this.settings.sidenavBg = this.settings.defaultSidenavBg;
  this.settings.footerBg = this.settings.defaultFooterBg;
  this.settings.theme = this.settings.defaultTheme;
};
ThemeSettings.prototype._initDirection = function() {};
ThemeSettings.prototype._initStyle = function() {};
ThemeSettings.prototype._initTheme = function() {};
ThemeSettings.prototype._waitForNavs = function() {};
ThemeSettings.prototype._loadingState = function() {};
ThemeSettings.prototype.setRtl = function() {};
ThemeSettings.prototype.setMaterial = function() {};
ThemeSettings.prototype.setTheme = function() {};
ThemeSettings.prototype.setLayoutPosition = function() {};
ThemeSettings.prototype.setLayoutNavbarFixed = function() {};
ThemeSettings.prototype.setLayoutFooterFixed = function() {};
ThemeSettings.prototype.setLayoutReversed = function() {};
ThemeSettings.prototype.setNavbarBg = function() {};
ThemeSettings.prototype.setSidenavBg = function() {};
ThemeSettings.prototype.setFooterBg = function() {};
ThemeSettings.prototype.update = function() {};
ThemeSettings.prototype.updateNavbarBg = function() {};
ThemeSettings.prototype.updateSidenavBg = function() {};
ThemeSettings.prototype.updateFooterBg = function() {};
ThemeSettings.prototype.clearLocalStorage = function() {};

// ThemeSettings constants
var AVAILABLE_THEMES = [
  { name: 'theme-air', title: 'Air', colors: { primary: '#3c97fe', navbar: '#f8f8f8', sidenav: '#f8f8f8' } },
  { name: 'theme-corporate', title: 'Corporate', colors: { primary: '#26B4FF', navbar: '#fff', sidenav: '#2e323a' } },
  { name: 'theme-cotton', title: 'Сotton', colors: { primary: '#e84c64', navbar: '#ffffff', sidenav: '#ffffff' } },
  { name: 'theme-gradient', title: 'Gradient', colors: { primary: '#775cdc', navbar: '#ffffff', sidenav: 'linear-gradient(to top, #4e54c8, #8c55e4)' } },
  { name: 'theme-paper', title: 'Paper', colors: { primary: '#17b3a3', navbar: '#ffffff', sidenav: '#ffffff' } },
  { name: 'theme-shadow', title: 'Shadow', colors: { primary: '#7b83ff', navbar: '#f8f8f8', sidenav: '#ececf9' } },
  { name: 'theme-soft', title: 'Soft', colors: { primary: '#1cbb84', navbar: '#39517b', sidenav: '#ffffff' } },
  { name: 'theme-sunrise', title: 'Sunrise', colors: { primary: '#fc5a5c', navbar: '#222222', sidenav: '#ffffff' } },
  { name: 'theme-twitlight', title: 'Twitlight', colors: { primary: '#4c84ff', navbar: '#343c44', sidenav: '#3f4853' } },
  { name: 'theme-vibrant', title: 'Vibrant', colors: { primary: '#fc5a5c', navbar: '#f8f8f8', sidenav: '#222222' } },
];
var DEFAULT_THEME = 1;
var CSS_FILENAME_PATTERN = '%name%.css';
var CONTROLS = [ 'rtl', 'material', 'layoutPosition', 'layoutNavbarFixed', 'layoutFooterFixed', 'layoutReversed', 'navbarBg', 'sidenavBg', 'footerBg', 'themes' ];
var NAVBAR_BGS = [ 'navbar-theme', 'primary', 'primary-dark navbar-dark', 'primary-darker navbar-dark', 'secondary', 'secondary-dark navbar-dark', 'secondary-darker navbar-dark', 'success', 'success-dark navbar-dark', 'success-darker navbar-dark', 'info', 'info-dark navbar-dark', 'info-darker navbar-dark', 'warning', 'warning-dark navbar-light', 'warning-darker navbar-light', 'danger', 'danger-dark navbar-dark', 'danger-darker navbar-dark', 'dark', 'white', 'light', 'lighter' ];
var DEFAULT_NAVBAR_BG = 'navbar-theme';
var SIDENAV_BGS = [ 'sidenav-theme', 'primary', 'primary-dark sidenav-dark', 'primary-darker sidenav-dark', 'secondary', 'secondary-dark sidenav-dark', 'secondary-darker sidenav-dark', 'success', 'success-dark sidenav-dark', 'success-darker sidenav-dark', 'info', 'info-dark sidenav-dark', 'info-darker sidenav-dark', 'warning', 'warning-dark sidenav-light', 'warning-darker sidenav-light', 'danger', 'danger-dark sidenav-dark', 'danger-darker sidenav-dark', 'dark', 'white', 'light', 'lighter' ];
var DEFAULT_SIDENAV_BG = 'sidenav-theme';
var FOOTER_BGS = [ 'footer-theme', 'primary', 'primary-dark footer-dark', 'primary-darker footer-dark', 'secondary', 'secondary-dark footer-dark', 'secondary-darker footer-dark', 'success', 'success-dark footer-dark', 'success-darker footer-dark', 'info', 'info-dark footer-dark', 'info-darker footer-dark', 'warning', 'warning-dark footer-light', 'warning-darker footer-light', 'danger', 'danger-dark footer-dark', 'danger-darker footer-dark', 'dark', 'white', 'light', 'lighter' ];
var DEFAULT_FOOTER_BG = 'footer-theme';

var CSS_PATH = 'assets/vendor/css/';

new Vue({
  el: '#generator-settings-panel',
  data: function () {
    return {
      options: {
        cssPath: CSS_PATH,
        themesPath: CSS_PATH,
        cssFilenamePattern: CSS_FILENAME_PATTERN,

        rtlSwitcher: true,
        materialSwitcher: true,
        layoutPositionSwitcher: true,
        layoutNavbarFixedSwitcher: true,
        layoutFooterFixedSwitcher: true,
        layoutReversedSwitcher: true,

        navbarBgSwitcher: true,
        availableNavbarBgs: NAVBAR_BGS,
        defaultNavbarBg: DEFAULT_NAVBAR_BG,

        sidenavBgSwitcher: true,
        availableSidenavBgs: SIDENAV_BGS,
        defaultSidenavBg: DEFAULT_SIDENAV_BG,

        footerBgSwitcher: true,
        availableFooterBgs: FOOTER_BGS,
        defaultFooterBg: DEFAULT_FOOTER_BG,

        themesSwitcher: true,
        availableThemes: AVAILABLE_THEMES,
        defaultTheme: AVAILABLE_THEMES[DEFAULT_THEME].name
      },

      oldNavbarBgSwitcher: true,
      oldAvailableNavbarBgs: null,
      oldSidenavBgSwitcher: true,
      oldAvailableSidenavBgs: null,
      oldFooterBgSwitcher: true,
      oldAvailableFooterBgs: null,
      oldThemesSwitcher: true,
      oldAvailableThemes: null,

      navbarBgs: NAVBAR_BGS,
      sidenavBgs: SIDENAV_BGS,
      footerBgs: FOOTER_BGS,
      themes: AVAILABLE_THEMES,

      panelInstance: null,
      originalContent: '',
      highlightedContent: '',
    };
  },
  mounted: function() {
    this.createPanelInstance();
  },
  watch: {
    options: {
      handler: function(options) {
        var newOptions = this.checkOptions(options);
        if (newOptions) this.options = newOptions;
        else this.generate();
      },
      deep: true
    }
  },
  methods: {
    createPanelInstance: function(opts) {
      this.destroyPanelInstance();
      this.panelInstance = new ThemeSettings(opts || {});
    },
    destroyPanelInstance: function() {
      if (!this.panelInstance) { return; }
      this.panelInstance.destroy();
      this.panelInstance = null;
    },
    generate: function() {
      var opts = this.getPanelOptions();
      this.createPanelInstance(opts);

      // Add helper function
      opts.printArray = function(arr, tabs) {
        var spacer = tabs ? '  '.repeat(tabs) : '';
        var result = [];
        var curLine = '';

        arr.forEach(function(item, i) {
          curLine += item;

          if (curLine.length > 60) {
            result.push(curLine);
            curLine = '';
            return;
          }

          if (i !== arr.length - 1) { curLine += '\', \''; }
        });
        if (curLine) { result.push(curLine); }

        return spacer + '\'' + result.join('\',\n' + spacer + '\'') + '\'';
      };

      this.originalContent = generatorParse({
        'settingsPanel': { template: SETTINGS_PANEL_TEMPLATE }
      }, opts)['settingsPanel'];
      this.highlightedContent = generatorHighlight(this.originalContent, 'javascript');
    },
    themeOptionFormatter(theme) {
      return theme.title
    },
    checkOptions: function(options) {
      var cloned = {}; _.merge(cloned, options);
      var changed = false;

      if (cloned.navbarBgSwitcher !== this.oldNavbarBgSwitcher) {
        this.oldNavbarBgSwitcher = cloned.navbarBgSwitcher;

        if (cloned.navbarBgSwitcher) {
          cloned.availableNavbarBgs = this.oldAvailableNavbarBgs;
        } else {
          this.oldAvailableNavbarBgs = cloned.availableNavbarBgs;
          cloned.availableNavbarBgs = NAVBAR_BGS;
        }

        changed = true;
      }

      if (cloned.sidenavBgSwitcher !== this.oldSidenavBgSwitcher) {
        this.oldSidenavBgSwitcher = cloned.sidenavBgSwitcher;

        if (cloned.sidenavBgSwitcher) {
          cloned.availableSidenavBgs = this.oldAvailableSidenavBgs;
        } else {
          this.oldAvailableSidenavBgs = cloned.availableSidenavBgs;
          cloned.availableSidenavBgs = SIDENAV_BGS;
        }

        changed = true;
      }

      if (cloned.footerBgSwitcher !== this.oldFooterBgSwitcher) {
        this.oldFooterBgSwitcher = cloned.footerBgSwitcher;

        if (cloned.footerBgSwitcher) {
          cloned.availableFooterBgs = this.oldAvailableFooterBgs;
        } else {
          this.oldAvailableFooterBgs = cloned.availableFooterBgs;
          cloned.availableFooterBgs = FOOTER_BGS;
        }

        changed = true;
      }

      if (cloned.themesSwitcher !== this.oldThemesSwitcher) {
        this.oldThemesSwitcher = cloned.themesSwitcher;

        if (cloned.themesSwitcher) {
          cloned.availableThemes = this.oldAvailableThemes;
        } else {
          this.oldAvailableThemes = cloned.availableThemes;
          cloned.availableThemes = AVAILABLE_THEMES;
        }

        changed = true;
      }

      if (cloned.availableNavbarBgs.indexOf(cloned.defaultNavbarBg) === -1) {
        cloned.defaultNavbarBg = cloned.availableNavbarBgs[0];
        changed = true;
      }

      if (cloned.availableSidenavBgs.indexOf(cloned.defaultSidenavBg) === -1) {
        cloned.defaultSidenavBg = cloned.availableSidenavBgs[0];
        changed = true;
      }

      if (cloned.availableFooterBgs.indexOf(cloned.defaultFooterBg) === -1) {
        cloned.defaultFooterBg = cloned.availableFooterBgs[0];
        changed = true;
      }

      if (!this.getThemeFromList(cloned.defaultTheme, cloned.availableThemes)) {
        cloned.defaultTheme = cloned.availableThemes[0].name;
        changed = true;
      }

      return changed ? cloned : null
    },
    getThemeFromList: function(name, list) {
      var result = list.filter(function(i) {
        return i.name === name;
      });
      return result.length ? result[0] : null;
    },
    getPanelOptions: function() {
      var result = {
        cssPath: this.options.cssPath,
        themesPath: this.options.themesPath
      };

      if (this.options.cssFilenamePattern !== CSS_FILENAME_PATTERN) {
        result.cssFilenamePattern = this.options.cssFilenamePattern
      }

      var controls = [];
      if (this.options.rtlSwitcher) { controls.push('rtl'); }
      if (this.options.materialSwitcher) { controls.push('material'); }
      if (this.options.layoutPositionSwitcher) { controls.push('layoutPosition'); }
      if (this.options.layoutNavbarFixedSwitcher) { controls.push('layoutNavbarFixed'); }
      if (this.options.layoutFooterFixedSwitcher) { controls.push('layoutFooterFixed'); }
      if (this.options.layoutReversedSwitcher) { controls.push('layoutReversed'); }
      if (this.options.navbarBgSwitcher) { controls.push('navbarBg'); }
      if (this.options.sidenavBgSwitcher) { controls.push('sidenavBg'); }
      if (this.options.footerBgSwitcher) { controls.push('footerBg'); }
      if (this.options.themesSwitcher) { controls.push('themes'); }
      if (controls.length !== CONTROLS.length) { result.controls = controls; }

      if (this.options.defaultNavbarBg !== DEFAULT_NAVBAR_BG && this.options.navbarBgSwitcher) {
        result.defaultNavbarBg = this.options.defaultNavbarBg;
      }
      if (this.options.navbarBgSwitcher && this.options.availableNavbarBgs.length !== NAVBAR_BGS.length) {
        result.navbarBgs = this.options.availableNavbarBgs;
      }

      if (this.options.defaultSidenavBg !== DEFAULT_SIDENAV_BG && this.options.sidenavBgSwitcher) {
        result.defaultSidenavBg = this.options.defaultSidenavBg;
      }
      if (this.options.sidenavBgSwitcher && this.options.availableSidenavBgs.length !== SIDENAV_BGS.length) {
        result.sidenavBgs = this.options.availableSidenavBgs;
      }

      if (this.options.defaultFooterBg !== DEFAULT_FOOTER_BG && this.options.footerBgSwitcher) {
        result.defaultFooterBg = this.options.defaultFooterBg;
      }
      if (this.options.footerBgSwitcher && this.options.availableFooterBgs.length !== FOOTER_BGS.length) {
        result.footerBgs = this.options.availableFooterBgs;
      }

      var defaultThemeIndex = this.options.availableThemes.indexOf(
        this.getThemeFromList(this.options.defaultTheme, this.options.availableThemes)
      );

      if (defaultThemeIndex !== DEFAULT_THEME && this.options.themesSwitcher) {
        result.defaultTheme = defaultThemeIndex;
      }
      if (this.options.themesSwitcher && this.options.availableThemes.length !== AVAILABLE_THEMES.length) {
        result.availableThemes = this.options.availableThemes;
      }

      return result;
    }
  }
})
