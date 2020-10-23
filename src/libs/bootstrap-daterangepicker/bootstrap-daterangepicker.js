require('bootstrap-daterangepicker/daterangepicker.js');

// Monkey-patch to detect when weeks are shown

var fnDaterangepicker = $.fn.daterangepicker;

$.fn.daterangepicker = function(options, callback) {
  fnDaterangepicker.call(this, options, callback);

  if (options && (options.showWeekNumbers || options.showISOWeekNumbers)) {
    this.each(function() {
      var instance = $(this).data('daterangepicker');
      if (instance && instance.container) instance.container.addClass('with-week-numbers');
    });
  }

  return this;
};
