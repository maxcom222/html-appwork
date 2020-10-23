$(function() {
  $('.docs-version .nav-link').click(function(e) {
    e.preventDefault();
    $('.docs-version .nav-link').removeClass('active');
    $(this).addClass('active');
    $('body')[$(this).attr('href') === '#with-theme-settings' ? 'addClass' : 'removeClass']('with-theme-settings');
  });

  $('.docs-framework-version .nav-link').click(function(e) {
    e.preventDefault();
    $('.docs-framework-version .nav-link').removeClass('active');
    $(this).addClass('active');
    $('body').removeClass('html5-version angular-version vuejs-version');
    $('body').addClass($(this).attr('href').replace('#', '') + '-version');
  });

  if ($('.docs-framework-version').length) {
    $('body').addClass('html5-version');
  }

  function updateDocsSections() {
    var top = $(document).scrollTop();
    var left = $(document).scrollLeft();
    $('.docs-sections')[0].style.top = (top > 70 ? 0 : 70 - top) + 'px';
    $('.docs-sections')[0].style.left = (left * -1) + 'px';
  }

  $(document).on('scroll', updateDocsSections);
  updateDocsSections();

  function getActiveSection() {
    var scrollTop = $(document).scrollTop();
    var windowHeight = $(window).innerHeight();
    var $active = null;
    var $headers = $($('.docs-header-anchor:visible').get().reverse());

    $headers.each(function() {
      if ($active) return;
      var top = $(this).offset().top;

      if (top < (scrollTop + (windowHeight / 2))) {
        $active = $(this);

        var $prev = $headers.eq($headers.index(this) + 1);
        while ($prev.length && $prev.offset().top > scrollTop) {
          $active = $prev;
          $prev = $headers.eq($headers.index($prev) + 1);
        }
      }
    });
    return $active ? $active.find('a').attr('name') : null;
  }

  function setActiveSection() {
    var active = getActiveSection();
    var $el = $('.docs-sections-inner');

    $el.find('a').removeClass('active');
    if (active) $el.find('a[href="#' + active + '"]').addClass('active');
  }

  $(document).on('scroll', setActiveSection);
  $(window).on('resize', setActiveSection);
  setActiveSection();

  $('pre.docs-code > code').each(function(i, block) {
    hljs.highlightBlock(block);
  });

  $('.docs-nav').on('click', '.nav-link', function(e) {
    e.preventDefault();
    $(this).parents('.docs-nav').find('.nav-link').removeClass('active');
    $(this).addClass('active');
    $(this).parents('.docs-nav')
      .nextAll('.docs-nav-content').removeClass('d-block').addClass('d-none')
      .filter($(this).attr('href')).removeClass('d-none').addClass('d-block');
  });

  var $migrations = $('#migration > .migration-guide');
  var $migrationSelect = $('#migration-select');

  function showMigration(id) {
    $migrations.removeClass('d-block');
    $('#' + id).addClass('d-block');
  }

  $migrations.each(function(i) {
    var $this = $(this);
    var $option = $('<option value="' + $this.attr('id') + '">' + $this.attr('data-name') + '</option>');
    if (i === 0) {
      $option.attr('selected', 'selected');
      showMigration($this.attr('id'));
    }
    $migrationSelect.append($option);
  });

  $migrationSelect.on('change', function () {
    showMigration(this.value);
  });
});
