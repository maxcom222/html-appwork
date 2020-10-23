import Util from 'bootstrap/js/src/util.js';
import Alert from 'bootstrap/js/src/alert.js';
import Button from 'bootstrap/js/src/button.js';
import Carousel from 'bootstrap/js/src/carousel.js';
import Collapse from 'bootstrap/js/src/collapse.js';
import Dropdown from 'bootstrap/js/src/dropdown.js';
import Modal from 'bootstrap/js/src/modal.js';
import Scrollspy from 'bootstrap/js/src/scrollspy.js';
import Tab from 'bootstrap/js/src/tab.js';
import Toast from 'bootstrap/js/src/toast.js';
import Tooltip from 'bootstrap/js/src/tooltip.js';
import Popover from 'bootstrap/js/src/popover.js';

// Tooltip extension
//

const bsTooltipSetContent = Tooltip.prototype.setContent;

// Set tooltip state
Tooltip.prototype.setContent = function() {
  const state = this.element.getAttribute('data-state');

  if (state) {
    $(this.getTipElement()).addClass(`tooltip-${state.replace(/[^a-z0-9_-]/ig, '')}`);
  }

  bsTooltipSetContent.call(this);
};

// Popover extension
//

const bsPopoverSetContent = Popover.prototype.setContent;

// Set popover state
Popover.prototype.setContent = function() {
  const state = this.element.getAttribute('data-state');

  if (state) {
    $(this.getTipElement()).addClass(`popover-${state.replace(/[^a-z0-9_-]/ig, '')}`);
  }

  bsPopoverSetContent.call(this);
};

export {
  Util,
  Alert,
  Button,
  Carousel,
  Collapse,
  Dropdown,
  Modal,
  Scrollspy,
  Tab,
  Toast,
  Tooltip,
  Popover
};
