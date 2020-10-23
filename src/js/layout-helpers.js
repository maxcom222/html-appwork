// Constants
const TRANSITION_EVENTS = ['transitionend','webkitTransitionEnd','oTransitionEnd']
const TRANSITION_PROPERTIES = ['transition', 'MozTransition', 'webkitTransition', 'WebkitTransition', 'OTransition']
const INLINE_STYLE = `
.layout-fixed .layout-1 .layout-sidenav,
.layout-fixed-offcanvas .layout-1 .layout-sidenav {
  top: {navbarHeight}px !important;
}
.layout-container {
  padding-top: {navbarHeight}px !important;
}
.layout-content {
  padding-bottom: {footerHeight}px !important;
}`

// Guard
function requiredParam(name) {
  throw new Error(`Parameter required${name ? ': `' + name + '`' : ''}`)
}

const layoutHelpers = {
  // Root container
  CONTAINER: typeof window !== 'undefined' ? document.documentElement : null,

  // Large screens breakpoint
  LAYOUT_BREAKPOINT: 992,

  // Resize delay in milliseconds
  RESIZE_DELAY: 200,

  // Internal variables
  _curStyle: null,
  _styleEl: null,
  _resizeTimeout: null,
  _resizeCallback: null,
  _transitionCallback: null,
  _transitionCallbackTimeout: null,
  _listeners: [],
  _initialized: false,
  _autoUpdate: false,
  _lastWindowHeight: 0,


  // *******************************************************************************
  // * Utilities

  // ---
  // Add class
  _addClass(cls, el = this.CONTAINER) {
    cls.split(' ').forEach(c => el.classList.add(c))
  },

  // ---
  // Remove class
  _removeClass(cls, el = this.CONTAINER) {
    cls.split(' ').forEach(c => el.classList.remove(c))
  },

  // ---
  // Has class
  _hasClass(cls, el = this.CONTAINER) {
    let result = false

    cls.split(' ').forEach(c => {
      if (el.classList.contains(c)) result = true
    })

    return result
  },

  // ---
  // Check for transition support
  _supportsTransitionEnd() {
    if (window.QUnit) return false

    const el = document.body || document.documentElement

    if (!el) return false

    let result = false
    TRANSITION_PROPERTIES.forEach(evnt => {
      if (typeof el.style[evnt] !== 'undefined') result = true
    })

    return result
  },

  // ---
  // Get animation duration of element
  _getAnimationDuration(el) {
    let duration = window.getComputedStyle(el).transitionDuration

    return parseFloat(duration) * (duration.indexOf('ms') !== -1 ? 1 : 1000)
  },

  // ---
  // Trigger window event
  _triggerWindowEvent(name) {
    if (typeof window === 'undefined') return

    if (document.createEvent) {
      let event

      if (typeof(Event) === 'function') {
        event = new Event(name)
      } else {
        event = document.createEvent('Event')
        event.initEvent(name, false, true)
      }

      window.dispatchEvent(event)
    } else {
      window.fireEvent(`on${name}`, document.createEventObject())
    }
  },

  // ---
  // Trigger event
  _triggerEvent(name) {
    this._triggerWindowEvent(`layout${name}`)

    this._listeners
      .filter(listener => listener.event === name)
      .forEach(listener => listener.callback.call(null))
  },

  // ---
  // Update style
  _updateInlineStyle(navbarHeight = 0, footerHeight = 0) {
    if (!this._styleEl) {
      this._styleEl = document.createElement('style')
      this._styleEl.type = 'text/css'
      document.head.appendChild(this._styleEl)
    }

    const newStyle = INLINE_STYLE
      .replace(/\{navbarHeight\}/ig, navbarHeight)
      .replace(/\{footerHeight\}/ig, footerHeight)

    if (this._curStyle !== newStyle) {
      this._curStyle = newStyle
      this._styleEl.textContent = newStyle
    }
  },

  // ---
  // Remove style
  _removeInlineStyle() {
    if (this._styleEl) document.head.removeChild(this._styleEl)
    this._styleEl = null
    this._curStyle = null
  },

  // ---
  // Redraw layout sidenav (Safari bugfix)
  _redrawLayoutSidenav() {
    const layoutSidenav = this.getLayoutSidenav()

    if (layoutSidenav && layoutSidenav.querySelector('.sidenav')) {
      const inner = layoutSidenav.querySelector('.sidenav-inner')
      const scrollTop = inner.scrollTop
      const pageScrollTop = document.documentElement.scrollTop

      layoutSidenav.style.display = 'none'
      layoutSidenav.offsetHeight
      layoutSidenav.style.display = ''
      inner.scrollTop = scrollTop
      document.documentElement.scrollTop = pageScrollTop

      return true
    }

    return false
  },

  // ---
  // Calculate current navbar height
  _getNavbarHeight() {
    const layoutNavbar = this.getLayoutNavbar()

    if (!layoutNavbar) return 0
    if (!this.isSmallScreen()) return layoutNavbar.getBoundingClientRect().height

    // Needs some logic to get navbar height on small screens

    const clonedEl = layoutNavbar.cloneNode(true)
    clonedEl.id = null
    clonedEl.style.visibility = 'hidden'
    clonedEl.style.position = 'absolute'

    Array.prototype.slice.call(clonedEl.querySelectorAll('.collapse.show'))
      .forEach(el => this._removeClass('show', el))

    layoutNavbar.parentNode.insertBefore(clonedEl, layoutNavbar)

    const navbarHeight = clonedEl.getBoundingClientRect().height

    clonedEl.parentNode.removeChild(clonedEl)

    return navbarHeight
  },

  // ---
  // Get current footer height
  _getFooterHeight() {
    const layoutFooter = this.getLayoutFooter()

    if (!layoutFooter) return 0

    return layoutFooter.getBoundingClientRect().height
  },

  // ---
  // Add layout sivenav toggle animationEnd event
  _bindLayoutAnimationEndEvent(modifier, cb) {
    const sidenav = this.getSidenav()
    const duration = sidenav ? this._getAnimationDuration(sidenav) + 50 : 0

    if (!duration) {
      modifier.call(this)
      cb.call(this)
      return
    }

    this._transitionCallback = e => {
      if (e.target !== sidenav) return
      this._unbindLayoutAnimationEndEvent()
      cb.call(this)
    }

    TRANSITION_EVENTS.forEach(e => {
      sidenav.addEventListener(e, this._transitionCallback, false)
    })

    modifier.call(this)

    this._transitionCallbackTimeout = setTimeout(() => {
      this._transitionCallback.call(this, { target: sidenav })
    }, duration)
  },

  // ---
  // Remove layout sivenav toggle animationEnd event
  _unbindLayoutAnimationEndEvent() {
    const sidenav = this.getSidenav()

    if (this._transitionCallbackTimeout) {
      clearTimeout(this._transitionCallbackTimeout)
      this._transitionCallbackTimeout = null
    }

    if (sidenav && this._transitionCallback) {
      TRANSITION_EVENTS.forEach(e => {
        sidenav.removeEventListener(e, this._transitionCallback, false)
      })
    }

    if (this._transitionCallback) {
      this._transitionCallback = null
    }
  },

  // ---
  // Bind delayed window resize event
  _bindWindowResizeEvent() {
    this._unbindWindowResizeEvent()

    const cb = () => {
      if (this._resizeTimeout) {
        clearTimeout(this._resizeTimeout)
        this._resizeTimeout = null
      }
      this._triggerEvent('resize')
    }

    this._resizeCallback = () => {
      if (this._resizeTimeout) clearTimeout(this._resizeTimeout)
      this._resizeTimeout = setTimeout(cb, this.RESIZE_DELAY)
    }

    window.addEventListener('resize', this._resizeCallback, false)
  },

  // ---
  // Unbind delayed window resize event
  _unbindWindowResizeEvent() {
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout)
      this._resizeTimeout = null
    }

    if (this._resizeCallback) {
      window.removeEventListener('resize', this._resizeCallback, false)
      this._resizeCallback = null
    }
  },

  // ---
  // Set sidenav hover state
  _setSidenavHoverState(hovered) {
    this[hovered ? '_addClass' : '_removeClass']('layout-sidenav-hover')
  },

  // ---
  // Toggle collapsed
  _setCollapsed(collapsed) {
    if (this.isSmallScreen()) {
      if (collapsed) {
        this._removeClass('layout-expanded')
      } else {
        setTimeout(() => {
          this._addClass('layout-expanded')
        }, this._redrawLayoutSidenav() ? 5 : 0)
      }
    } else {
      this[collapsed ? '_addClass' : '_removeClass']('layout-collapsed')
    }
  },

  _findParent(el, cls) {
    if (el && el.tagName.toUpperCase() === 'BODY') return null
    el = el.parentNode
    while (el && el.tagName.toUpperCase() !== 'BODY' && !el.classList.contains(cls)) {
      el = el.parentNode
    }
    el = el && el.tagName.toUpperCase() !== 'BODY' ? el : null
    return el
  },

  _bindSidenavMouseEvents() {
    if (this._sidenavMouseEnter && this._sidenavMouseLeave && this._windowTouchStart) return

    const layoutSidenav = this.getLayoutSidenav()
    if (!layoutSidenav) return this._unbindSidenavMouseEvents()

    if (!this._sidenavMouseEnter) {
      this._sidenavMouseEnter = () => {
        if (this.isSmallScreen() || !this._hasClass('layout-collapsed') ||
            this.isOffcanvas() || this._hasClass('layout-transitioning')) {
          return this._setSidenavHoverState(false)
        }

        this._setSidenavHoverState(true)
      }
      layoutSidenav.addEventListener('mouseenter', this._sidenavMouseEnter, false)
      layoutSidenav.addEventListener('touchstart', this._sidenavMouseEnter, false)
    }

    if (!this._sidenavMouseLeave) {
      this._sidenavMouseLeave = () => {
        this._setSidenavHoverState(false)
      }
      layoutSidenav.addEventListener('mouseleave', this._sidenavMouseLeave, false)
    }

    if (!this._windowTouchStart) {
      this._windowTouchStart = e => {
        if (!e || !e.target || !this._findParent(e.target, '.layout-sidenav')) {
          this._setSidenavHoverState(false)
        }
      }
      window.addEventListener('touchstart', this._windowTouchStart, true)
    }
  },

  _unbindSidenavMouseEvents() {
    if (!this._sidenavMouseEnter && !this._sidenavMouseLeave && !this._windowTouchStart) return

    const layoutSidenav = this.getLayoutSidenav()

    if (this._sidenavMouseEnter) {
      if (layoutSidenav) {
        layoutSidenav.removeEventListener('mouseenter', this._sidenavMouseEnter, false)
        layoutSidenav.removeEventListener('touchstart', this._sidenavMouseEnter, false)
      }
      this._sidenavMouseEnter = null
    }

    if (this._sidenavMouseLeave) {
      if (layoutSidenav) {
        layoutSidenav.removeEventListener('mouseleave', this._sidenavMouseLeave, false)
      }
      this._sidenavMouseLeave = null
    }

    if (this._windowTouchStart) {
      if (layoutSidenav) {
        window.addEventListener('touchstart', this._windowTouchStart, true)
      }
      this._windowTouchStart = null
    }

    this._setSidenavHoverState(false)
  },


  // *******************************************************************************
  // * Getters

  getLayoutSidenav() {
    return document.querySelector('.layout-sidenav')
  },

  getSidenav() {
    const layoutSidenav = this.getLayoutSidenav()

    if (!layoutSidenav) return null

    return !this._hasClass('sidenav', layoutSidenav) ?
      layoutSidenav.querySelector('.sidenav') :
      layoutSidenav
  },

  getLayoutNavbar() {
    return document.querySelector('.layout-navbar')
  },

  getLayoutFooter() {
    return document.querySelector('.layout-footer')
  },

  getLayoutContainer() {
    return document.querySelector('.layout-container')
  },


  // *******************************************************************************
  // * Tests

  isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)
  },

  isSmallScreen() {
    return (
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    ) < this.LAYOUT_BREAKPOINT
  },

  isLayout1() {
    return !!document.querySelector('.layout-wrapper.layout-1')
  },

  isCollapsed() {
    if (this.isSmallScreen()) {
      return !this._hasClass('layout-expanded')
    } else {
      return this._hasClass('layout-collapsed')
    }
  },

  isFixed() {
    return this._hasClass('layout-fixed layout-fixed-offcanvas')
  },

  isOffcanvas() {
    return this._hasClass('layout-offcanvas layout-fixed-offcanvas')
  },

  isNavbarFixed() {
    return this._hasClass('layout-navbar-fixed') ||
           (!this.isSmallScreen() && this.isFixed() && this.isLayout1())
  },

  isFooterFixed() {
    return this._hasClass('layout-footer-fixed');
  },

  isReversed() {
    return this._hasClass('layout-reversed')
  },


  // *******************************************************************************
  // * Methods

  // ---
  // Collapse / expand layout
  setCollapsed(collapsed = requiredParam('collapsed'), animate = true) {
    const layoutSidenav = this.getLayoutSidenav()

    if (!layoutSidenav) return

    this._unbindLayoutAnimationEndEvent()

    if (animate && this._supportsTransitionEnd()) {
      this._addClass('layout-transitioning')
      if (collapsed) this._setSidenavHoverState(false)

      this._bindLayoutAnimationEndEvent(() => {
        // Collapse / Expand
        this._setCollapsed(collapsed)
      }, () => {
        this._removeClass('layout-transitioning')
        this._triggerWindowEvent('resize')
        this._triggerEvent('toggle')
        this._setSidenavHoverState(false)
      })
    } else {
      this._addClass('layout-no-transition')
      if (collapsed) this._setSidenavHoverState(false)

      // Collapse / Expand
      this._setCollapsed(collapsed)

      setTimeout(() => {
        this._removeClass('layout-no-transition')
        this._triggerWindowEvent('resize')
        this._triggerEvent('toggle')
        this._setSidenavHoverState(false)
      }, 1)
    }
  },

  // ---
  // Toggle layout
  toggleCollapsed(animate = true) {
    this.setCollapsed(!this.isCollapsed(), animate)
  },

  // ---
  // Set layout positioning
  setPosition(fixed = requiredParam('fixed'), offcanvas = requiredParam('offcanvas')) {
    this._removeClass('layout-offcanvas layout-fixed layout-fixed-offcanvas')

    if (!fixed && offcanvas) {
      this._addClass('layout-offcanvas')
    } else if (fixed && !offcanvas) {
      this._addClass('layout-fixed')
      this._redrawLayoutSidenav()
    } else if (fixed && offcanvas) {
      this._addClass('layout-fixed-offcanvas')
      this._redrawLayoutSidenav()
    }

    this.update()
  },

  setNavbarFixed(fixed = requiredParam('fixed')) {
    this[fixed ? '_addClass' : '_removeClass']('layout-navbar-fixed')
    this.update()
  },

  setFooterFixed(fixed = requiredParam('fixed')) {
    this[fixed ? '_addClass' : '_removeClass']('layout-footer-fixed')
    this.update()
  },

  setReversed(reversed = requiredParam('reversed')) {
    this[reversed ? '_addClass' : '_removeClass']('layout-reversed')
  },


  // *******************************************************************************
  // * Update

  update() {
    if (
      (this.getLayoutNavbar() && (
        (!this.isSmallScreen() && this.isLayout1() && this.isFixed()) || this.isNavbarFixed()
      )) || (this.getLayoutFooter() && this.isFooterFixed())
    ) {
      this._updateInlineStyle(this._getNavbarHeight(), this._getFooterHeight())
    }

    this._bindSidenavMouseEvents()
  },

  setAutoUpdate(enable = requiredParam('enable')) {
    if (enable && !this._autoUpdate) {
      this.on('resize.layoutHelpers:autoUpdate', () => this.update())
      this._autoUpdate = true
    } else if (!enable && this._autoUpdate) {
      this.off('resize.layoutHelpers:autoUpdate')
      this._autoUpdate = false
    }
  },


  // *******************************************************************************
  // * Events

  on(event = requiredParam('event'), callback = requiredParam('callback')) {
    let [_event, ...namespace] = event.split('.')
    namespace = namespace.join('.') || null

    this._listeners.push({ event: _event, namespace, callback })
  },

  off(event = requiredParam('event')) {
    let [_event, ...namespace] = event.split('.')
    namespace = namespace.join('.') || null

    this._listeners
      .filter(listener => listener.event === _event && listener.namespace === namespace)
      .forEach(listener => this._listeners.splice(this._listeners.indexOf(listener), 1))
  },


  // *******************************************************************************
  // * Life cycle

  init() {
    if (this._initialized) return
    this._initialized = true

    // Initialize `style` element
    this._updateInlineStyle(0)

    // Bind window resize event
    this._bindWindowResizeEvent()

    // Bind init event
    this.off('init._layoutHelpers')
    this.on('init._layoutHelpers', () => {
      this.off('resize._layoutHelpers:redrawSidenav')
      this.on('resize._layoutHelpers:redrawSidenav', () => {
        this.isSmallScreen() && !this.isCollapsed() && this._redrawLayoutSidenav()
      })

      // Force repaint in IE 10
      if (typeof document.documentMode === 'number' && document.documentMode < 11) {
        this.off('resize._layoutHelpers:ie10RepaintBody')
        this.on('resize._layoutHelpers:ie10RepaintBody', () => {
          if (this.isFixed()) return
          const scrollTop = document.documentElement.scrollTop
          document.body.style.display = 'none'
          document.body.offsetHeight
          document.body.style.display = 'block'
          document.documentElement.scrollTop = scrollTop
        })
      }
    })

    this._triggerEvent('init')
  },

  destroy() {
    if (!this._initialized) return
    this._initialized = false

    this._removeClass('layout-transitioning')
    this._removeInlineStyle()
    this._unbindLayoutAnimationEndEvent()
    this._unbindWindowResizeEvent()
    this._unbindSidenavMouseEvents()
    this.setAutoUpdate(false)

    this.off('init._layoutHelpers')

    // Remove all listeners except `init`
    this._listeners
      .filter(listener => listener.event !== 'init')
      .forEach(listener => this._listeners.splice(this._listeners.indexOf(listener), 1))
  }
}


// *******************************************************************************
// * Initialization

if (typeof window !== 'undefined') {
  layoutHelpers.init()

  if (layoutHelpers.isMobileDevice() && window.chrome) {
    document.documentElement.classList.add('layout-sidenav-100vh')
  }

  // Update layout after page load
  if (document.readyState === 'complete') layoutHelpers.update()
  else document.addEventListener('DOMContentLoaded', function onContentLoaded() {
    layoutHelpers.update()
    document.removeEventListener('DOMContentLoaded', onContentLoaded)
  })
}

// ---
export { layoutHelpers }
