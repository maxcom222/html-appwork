Vue.component('gen-checkbox', {
  props: ['value', 'disabled'],
  template:
    '<label class="custom-control custom-checkbox docs-generator-checkbox">' +
      '<input v-model="value" :disabled="disabled" type="checkbox" @change="$emit(\'input\', $event.target.checked)" class="custom-control-input">' +
      '<span class="custom-control-label align-middle"><slot></slot></span>' +
    '</label>'
});

Vue.component('gen-select', {
  props: ['value', 'options', 'disabled'],
  template:
    '<select v-model="value" :disabled="disabled" @change="$emit(\'input\', $event.target.value)" class="custom-select custom-select-sm">' +
      '<slot><option v-for="option in options" :value="option[0]">{{option[1]}}</option></slot>' +
    '</select>'
});

Vue.component('gen-multiselect', {
  props: ['value', 'options', 'disabled', 'formatter', 'min'],
  data: function() {
    return {
      opened: false,
      opts: []
    };
  },
  mounted() {
    var self = this;
    this.options.forEach(function(opt) {
      self.opts.push({ key: opt, selected: self.value.indexOf(opt) !== -1 });
    });
  },
  watch: {
    opts: {
      handler: function(opts) {
        if (!opts || !opts.length) { return; }
        this.value = opts.filter(function(opt) {
          return opt.selected;
        }).map(function(opt) {
          return opt.key;
        });
        this.$emit('input', this.value);
      },
      deep: true
    }
  },
  template: `
<div class="docs-generator-multiselect" :class="{'border-secondary': opened}">
  <div class="docs-generator-multiselect-header clearfix">
    <slot></slot>
    <div class="mt-2" v-if="!disabled" :class="{'mb-3 p-2  mx--2 bg-lighter': opened}">
      <button type="button" @click="opened = !opened" class="btn btn-outline-secondary btn-xs">
        {{ opened ? 'Close' : 'Select' }}
      </button>
      &nbsp;
      <span class="docs-generator-multiselect-toggler text-muted"><strong>{{value.length !== options.length ? this.value.length : 'All'}}</strong> selected</span>
    </div>
  </div>
  <div v-if="opened && !disabled">
    <gen-checkbox
      v-for="(option, i) in opts"
      v-model="option.selected"
      :disabled="value.length < (min ? min + 1 : 0) && option.selected"
      :class="i < (options.length - 1) ? 'mb-2' : 'mb-0'">
      {{formatter ? formatter(option.key) : option.key}}
    </gen-checkbox>
  </div>
</div>
`
});

Vue.component('gen-tabs', {
  data: function() {
    return {
      activeTab: null,
      tabs: []
    }
  },
  mounted: function() {
    var self = this;

    this.tabs = this.$children.filter(function(c) {
      return c.$el.classList.contains('tab-pane');
    });

    this.tabs.forEach(function(tab) {
      tab.$on('hidden', function() {
        self.tabHidden(tab);
      });
    });

    this.setActive(this.tabs[0]);
  },
  methods: {
    setActive: function(tab) {
      this.tabs.forEach(function(_tab) {
        _tab.$el.classList.remove('show');
        _tab.$el.classList.remove('active');
      });

      this.activeTab = tab;
      tab.$el.classList.add('show');
      tab.$el.classList.add('active');
      this.$emit('tabchange', this.activeTab.title);
    },
    tabHidden(tab) {
      if (this.activeTab !== tab) { return; }
      var i = this.tabs.indexOf(tab);
      this.setActive(this.tabs[i === 0 ? 1 : i - 1]);
    }
  },
  template:
    '<div class="docs-generator-tabs">' +
      '<ul class="nav nav-pills nav-sm">' +
        '<li class="nav-item" v-for="tab in tabs" :class="{\'d-none\':tab.hidden}">' +
          '<a href="#" class="nav-link" :class="{active: tab === activeTab}" @click.prevent="setActive(tab)">{{tab.title}}</a>' +
        '</li>' +
      '</ul>' +
      '<div class="tab-content">' +
        '<slot></slot>' +
      '</div>' +
    '</div>'
});

Vue.component('gen-tab', {
  props: ['title', 'hidden'],
  data: function() {
    return {
      curScrollTop: 0
    };
  },
  watch: {
    hidden: function(val) {
      if (val) this.$emit('hidden');
    }
  },
  beforeUpdate() {
    var codeEl = this.$el.querySelector('.tab-pane > pre > code');
    if (codeEl) { this.curScrollTop = codeEl.scrollTop; }
  },
  updated() {
    var codeEl = this.$el.querySelector('.tab-pane > pre > code');
    if (codeEl) { codeEl.scrollTop = this.curScrollTop; }
  },
  template: '<div class="tab-pane" :class="{\'d-none\':hidden}"><slot></slot></div>'
});

Vue.component('gen-copy-btn', {
  props: ['file', 'text'],
  data: function() {
    return {
      copied: false
    };
  },
  mounted() {
    var self = this;
    var copyBtnTimeout = null;

    var clipboard = new ClipboardJS(this.$el, {
      text: function() { return self.text; }
    });

    function clearCopyTimeout() {
      if (copyBtnTimeout) {
        clearTimeout(copyBtnTimeout);
        copyBtnTimeout = null;
      }
    }

    clipboard.on('success', function() {
      clearCopyTimeout();
      self.copied = true

      copyBtnTimeout = setTimeout(function() {
        clearCopyTimeout();
        self.copied = false;
      }, 1000);
    });
  },
  template:
    '<button type="button" class="docs-generator-copy btn btn-primary btn-lg icon-btn btn-round" :title="\'Copy\' + (file ? \' `\' + file + \'`\' : \'\') + \' to clipboard\'" :class="{copied: copied}"></button>'
});

function generatorParse(tmpls, context) {
  var result = {};

  _.forOwn(tmpls, function(data, tmplName) {
    var c = {};
    _.merge(c, context, data.context || {}, { templateName: tmplName });

    result[tmplName] = nunjucks.renderString(data.template, c);
    if (data.formatter) { result[tmplName] = data.formatter(result[tmplName]); }
    result[tmplName] = result[tmplName].replace(/^\n+|\n+$/g, '').replace(/\n\s+\n/g, '\n\n').replace(/\t/g, '  ');
  });

  return result;
}

function generatorHighlight(src, lang) {
  var wrapper = document.createElement('div');
  var codeEl = document.createElement('code');
  lang = lang || 'html';

  codeEl.className = 'hljs ' + lang + ' xml';

  wrapper.appendChild(codeEl);

  codeEl.innerHTML = hljs.highlight(lang, src).value;

  return wrapper.innerHTML;
}

function updateGeneratorTabsPadding() {
  var tabs = document.querySelector('.docs-generator-tabs .nav');
  var code = document.querySelectorAll('.docs-generator-tabs .tab-pane > pre > code ');

  if (!tabs || !code.length) { return; }

  var h = tabs.getBoundingClientRect().height + 'px';

  for (var i = 0; i < code.length; i++) {
    code[i].style.top = h;
  }
}

// Mixins

window.generatorStarterMixin = {
  data: function () {
    return {
      options: {
        style: 'default',
        materialRipple: false,
        rtlSupport: false,
        rtlMode: false,
        settingsPanel: false,
        pageLayout: 'layout-1',
        layoutPosition: '',
        fixedNavbar: false,
        fixedFooter: false,
        reversedLayout: false,
        collapsedSidenav: false,
        theme: 'corporate',
        navbarBg: 'navbar-theme',
        sidenavBg: 'sidenav-theme',
        footerBg: 'footer-theme'
      },

      styleOptions: [
        ['default', 'Default style'], ['material', 'Material style']
      ],
      pageLayoutOptions: [
        ['layout-1', 'Layout 1'], ['layout-1-flex', 'Layout 1 - Flex'],
        ['layout-2', 'Layout 2'], ['layout-2-flex', 'Layout 2 - Flex'],
        ['without-navbar', 'Without navbar'], ['without-navbar-flex', 'Without navbar - Flex'],
        ['without-sidenav', 'Without sidenav'], ['horizontal-sidenav', 'Horizontal sidenav'],
        ['blank', 'Blank']
      ],
      layoutPositionOptions: [
        ['', 'Static'], ['offcanvas', 'Static offcanvas'], ['fixed', 'Fixed'],
        ['fixed-offcanvas', 'Fixed offcanvas']
      ],
      themeOptions: [
        ['air', 'Air'], ['corporate', 'Corporate'], ['cotton', 'Сotton'],
        ['gradient', 'Gradient'], ['paper', 'Paper'], ['shadow', 'Shadow'],
        ['soft', 'Soft'], ['sunrise', 'Sunrise'], ['twitlight', 'Twitlight'],
        ['vibrant', 'Vibrant']
      ],
      bgOptions: [
        'primary', 'primary-dark navbar-dark', 'primary-darker navbar-dark',
        'secondary', 'secondary-dark navbar-dark', 'secondary-darker navbar-dark',
        'success', 'success-dark navbar-dark', 'success-darker navbar-dark', 'info',
        'info-dark navbar-dark', 'info-darker navbar-dark', 'warning',
        'warning-dark navbar-light', 'warning-darker navbar-light', 'danger',
        'danger-dark navbar-dark', 'danger-darker navbar-dark', 'dark', 'white',
        'light', 'lighter'
      ],

      curTab: null
    };
  },
  computed: {
    navbarBgOptions: function() {
      return ['navbar-theme'].concat(this.bgOptions)
    },
    sidenavBgOptions: function() {
      return ['sidenav-theme'].concat(this.bgOptions).map(function(i) { return i.replace('navbar-', 'sidenav-'); })
    },
    footerBgOptions: function() {
      return ['footer-theme'].concat(this.bgOptions).map(function(i) { return i.replace('navbar-', 'footer-'); })
    }
  },
  watch: {
    options: {
      handler: function(options) {
        var newOptions = this._checkOptions(options);

        if (this.checkOptions) {
          newOptions = this.checkOptions(newOptions ? newOptions : options)
        }

        if (newOptions) this.options = newOptions;
        else this.generate();
      },
      deep: true
    }
  },
  mounted: function() {
    this.generate();

    this.$nextTick(updateGeneratorTabsPadding);
    window.addEventListener('resize', updateGeneratorTabsPadding, false);
  },
  methods: {
    _checkOptions: function(options) {
      var cloned = {}; _.merge(cloned, options);
      var changed = false;

      if (cloned.rtlMode && !cloned.rtlSupport) {
        cloned.rtlMode = false;
        changed = true;
      }

      if (cloned.materialRipple && cloned.style !== 'material' && !cloned.settingsPanel) {
        cloned.materialRipple = false;
        changed = true;
      }

      if (cloned.fixedNavbar && (cloned.pageLayout === 'without-navbar' || cloned.pageLayout === 'without-navbar-flex' || cloned.pageLayout === 'blank')) {
        cloned.fixedNavbar = false;
        changed = true;
      }

      if (cloned.fixedFooter && cloned.pageLayout === 'blank') {
        cloned.fixedFooter = false;
        changed = true;
      }

      if (cloned.reversedLayout && (options.pageLayout === 'without-sidenav' || options.pageLayout === 'horizontal-sidenav' || options.pageLayout === 'blank')) {
        cloned.reversedLayout = false;
        changed = true;
      }

      if (cloned.collapsedSidenav && (options.pageLayout === 'without-sidenav' || options.pageLayout === 'horizontal-sidenav' || options.pageLayout === 'blank')) {
        cloned.collapsedSidenav = false;
        changed = true;
      }

      if ((cloned.layoutPosition === 'offcanvas' || cloned.layoutPosition === 'fixed-offcanvas') && (cloned.pageLayout === 'without-sidenav' || cloned.pageLayout === 'horizontal-sidenav')) {
        cloned.layoutPosition = cloned.layoutPosition.replace(/-?offcanvas/, '');
        changed = true;
      }

      if (cloned.pageLayout === 'horizontal-sidenav' && / navbar-(?:dark|light)/.test(cloned.sidenavBg)) {
        cloned.sidenavBg = cloned.sidenavBg.replace(/-dark(?:er)? navbar-(?:dark|light)/, '');
        changed = true;
      }

      return changed ? cloned : null
    },
    layoutPositionOptionDisabled: function(position) {
      return (position === 'offcanvas' || position === 'fixed-offcanvas') && (this.options.pageLayout === 'without-sidenav' || this.options.pageLayout === 'horizontal-sidenav');
    },
    sidenavBgOptionDisabled: function(bg) {
      return this.options.pageLayout === 'horizontal-sidenav' && / navbar-(?:dark|light)/.test(bg)
    },
    tabChange: function(tabName) {
      this.curTab = tabName;
    }
  }
};
