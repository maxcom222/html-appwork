// Make vegas responsive
//

const fnVegas = $.fn.vegas;

$.fn.vegas = function(...args) {
  const result = fnVegas.apply(this, args);

  if (args[0] === undefined || typeof args[0] === 'object') {
    this.each(function() {
      if (this.tagName.toUpperCase() === 'BODY' || !this._vegas) { return; }

      $(this).css('height', '');
    });
  }

  return result;
};
