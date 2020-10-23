var HTML_TEMPLATE = document.getElementById('template__html').value;

new Vue({
  el: '#generator-html',
  mixins: [generatorStarterMixin],
  data: function () {
    return {
      options: {
        paceLoader: false,
      },

      originalContent: {
        'index.html': '',
        'page-2.html': ''
      },
      tabContent: {
        'index.html': '',
        'page-2.html': ''
      },
    };
  },
  methods: {
    generate: function() {
      this.originalContent = generatorParse({
        'index.html': {
          template: HTML_TEMPLATE,
          context: { pageTitle: 'Page 1' }
        },
        'page-2.html': {
          template: HTML_TEMPLATE,
          context: { pageTitle: 'Page 2'
        }}
      }, this.options);

      this.tabContent = {
        'index.html': generatorHighlight(this.originalContent['index.html']),
        'page-2.html': generatorHighlight(this.originalContent['page-2.html'])
      }
      this.$nextTick(updateGeneratorTabsPadding);
    }
  }
})
