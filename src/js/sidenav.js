const TRANSITION_EVENTS = ['transitionend','webkitTransitionEnd','oTransitionEnd']
const TRANSITION_PROPERTIES = ['transition', 'MozTransition', 'webkitTransition', 'WebkitTransition', 'OTransition']
const DELTA = 5

class SideNav {
  constructor(el, options = {}, _PS = null) {
    this._el = el
    this._horizontal = options.orientation === 'horizontal'
    this._animate = options.animate !== false && this._supportsTransitionEnd()
    this._accordion = options.accordion !== false
    this._closeChildren = Boolean(options.closeChildren)
    this._showDropdownOnHover = Boolean(options.showDropdownOnHover)
    this._rtl = document.documentElement.getAttribute('dir') === 'rtl' || document.body.getAttribute('dir') === 'rtl'

    this._lastWidth = this._horizontal ? window.innerWidth : null

    this._onOpen = options.onOpen || (() => {})
    this._onOpened = options.onOpened || (() => {})
    this._onClose = options.onClose || (() => {})
    this._onClosed = options.onClosed || (() => {})

    el.classList.add('sidenav')
    el.classList[this._animate ? 'remove' : 'add']('sidenav-no-animation')

    if (!this._horizontal) {
      el.classList.add('sidenav-vertical')
      el.classList.remove('sidenav-horizontal')

      const PerfectScrollbarLib = _PS || window.PerfectScrollbar

      if (PerfectScrollbarLib) {
        this._scrollbar = new PerfectScrollbarLib(
          el.querySelector('.sidenav-inner'),
          {
            suppressScrollX: true,
            wheelPropagation: true
          }
        )
      }
    } else {
      el.classList.add('sidenav-horizontal')
      el.classList.remove('sidenav-vertical')

      this._inner = el.querySelector('.sidenav-inner')
      const container = this._inner.parentNode

      this._prevBtn = el.querySelector('.sidenav-horizontal-prev')
      if (!this._prevBtn) {
        this._prevBtn = document.createElement('a')
        this._prevBtn.href = '#'
        this._prevBtn.className = 'sidenav-horizontal-prev'
        container.appendChild(this._prevBtn)
      }

      this._wrapper = el.querySelector('.sidenav-horizontal-wrapper')
      if (!this._wrapper) {
        this._wrapper = document.createElement('div')
        this._wrapper.className = 'sidenav-horizontal-wrapper'
        this._wrapper.appendChild(this._inner)
        container.appendChild(this._wrapper)
      }

      this._nextBtn = el.querySelector('.sidenav-horizontal-next')
      if (!this._nextBtn) {
        this._nextBtn = document.createElement('a')
        this._nextBtn.href = '#'
        this._nextBtn.className = 'sidenav-horizontal-next'
        container.appendChild(this._nextBtn)
      }

      this._innerPosition = 0
      this.update()
    }

    this._bindEvents()

    // Link sidenav instance to element
    el.sidenavInstance = this
  }

  open(el, closeChildren=this._closeChildren) {
    const item = this._findUnopenedParent(this._getItem(el, true), closeChildren)

    if (!item) return

    const toggleLink = this._getLink(item, true)

    this._promisify(this._onOpen, this, item, toggleLink, this._findMenu(item))
      .then(() => {
        if (!this._horizontal || !this._isRoot(item)) {
          if (this._animate) {
            window.requestAnimationFrame(() => this._toggleAnimation(true, item, false))
            if (this._accordion) this._closeOther(item, closeChildren)
          } else {
            item.classList.add('open')
            this._onOpened && this._onOpened(this, item, toggleLink, this._findMenu(item))
            if (this._accordion) this._closeOther(item, closeChildren)
          }
        } else {
          this._toggleDropdown(true, item, closeChildren)
          this._onOpened && this._onOpened(this, item, toggleLink, this._findMenu(item))
        }
      })
      .catch(() => {})
  }

  close(el, closeChildren=this._closeChildren, _autoClose=false) {
    const item = this._getItem(el, true)
    const toggleLink = this._getLink(el, true)

    if (!item.classList.contains('open') || item.classList.contains('disabled')) return

    this._promisify(this._onClose, this, item, toggleLink, this._findMenu(item), _autoClose)
      .then(() => {
        if (!this._horizontal || !this._isRoot(item)) {
          if (this._animate) {
            window.requestAnimationFrame(() => this._toggleAnimation(false, item, closeChildren))
          } else {
            item.classList.remove('open')

            if (closeChildren) {
              const opened = item.querySelectorAll('.sidenav-item.open')
              for (let i = 0, l = opened.length; i < l; i++) opened[i].classList.remove('open')
            }

            this._onClosed && this._onClosed(this, item, toggleLink, this._findMenu(item))
          }
        } else {
          this._toggleDropdown(false, item, closeChildren)
          this._onClosed && this._onClosed(this, item, toggleLink, this._findMenu(item))
        }
      })
      .catch(() => {})
  }

  toggle(el, closeChildren=this._closeChildren) {
    const item = this._getItem(el, true)

    if (item.classList.contains('open')) this.close(item, closeChildren)
    else this.open(item, closeChildren)
  }

  closeAll(closeChildren=this._closeChildren) {
    const opened = this._el.querySelectorAll('.sidenav-inner > .sidenav-item.open')

    for (let i = 0, l = opened.length; i < l; i++) this.close(opened[i], closeChildren)
  }

  setActive(el, active, openTree=true, deactivateOthers=true) {
    let item = this._getItem(el, false)

    if (active && deactivateOthers) {
      const activeItems = this._el.querySelectorAll('.sidenav-inner .sidenav-item.active')
      for (let i = 0, l = activeItems.length; i < l; i++) activeItems[i].classList.remove('active')
    }

    if (active && openTree) {
      const parentItem = this._findParent(item, 'sidenav-item', false)
      parentItem && this.open(parentItem)
    }

    while (item) {
      item.classList[active ? 'add' : 'remove']('active')
      item = this._findParent(item, 'sidenav-item', false)
    }
  }

  setDisabled(el, disabled) {
    this._getItem(el, false).classList[disabled ? 'add' : 'remove']('disabled')
  }

  isActive(el) {
    return this._getItem(el, false).classList.contains('active')
  }

  isOpened(el) {
    return this._getItem(el, false).classList.contains('open')
  }

  isDisabled(el) {
    return this._getItem(el, false).classList.contains('disabled')
  }

  update() {
    if (!this._horizontal) {
      if (this._scrollbar) {
        this._scrollbar.update()
      }
    } else {
      this.closeAll()

      const wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width)
      const innerWidth = this._innerWidth
      let position = this._innerPosition

      if ((wrapperWidth - position) > innerWidth) {
        position = wrapperWidth - innerWidth
        if (position > 0) position = 0
        this._innerPosition = position
      }

      this._updateSlider(wrapperWidth, innerWidth, position)
    }
  }

  _updateSlider(wrapperWidth = null, innerWidth = null, position = null) {
    const _wrapperWidth = wrapperWidth !== null ? wrapperWidth : Math.round(this._wrapper.getBoundingClientRect().width)
    const _innerWidth = innerWidth !== null ? innerWidth : this._innerWidth
    const _position = position !== null ? position : this._innerPosition

    if (_position === 0) this._prevBtn.classList.add('disabled')
    else this._prevBtn.classList.remove('disabled')

    if (_innerWidth + _position <= _wrapperWidth) this._nextBtn.classList.add('disabled')
    else this._nextBtn.classList.remove('disabled')
  }

  _promisify(fn, ...args) {
    const result = fn(...args)
    return result instanceof Promise
      ? result
      : (result === false ? Promise.reject() : Promise.resolve())
  }

  destroy() {
    if (!this._el) return

    this._unbindEvents()

    const items = this._el.querySelectorAll('.sidenav-item')
    for (let i = 0, l = items.length; i < l; i++) {
      this._unbindAnimationEndEvent(items[i])
      items[i].classList.remove('sidenav-item-animating')
      items[i].classList.remove('open')
      items[i].style.overflow = null
      items[i].style.height = null
    }

    const menus = this._el.querySelectorAll('.sidenav-menu')
    for (let i2 = 0, l2 = menus.length; i2 < l2; i2++) {
      menus[i2].style.marginRight = null
      menus[i2].style.marginLeft = null
    }

    this._el.classList.remove('sidenav-no-animation')

    if (this._wrapper) {
      this._prevBtn.parentNode.removeChild(this._prevBtn)
      this._nextBtn.parentNode.removeChild(this._nextBtn)
      this._wrapper.parentNode.insertBefore(this._inner, this._wrapper)
      this._wrapper.parentNode.removeChild(this._wrapper)
      this._inner.style.marginLeft = null
      this._inner.style.marginRight = null
    }

    this._el.sidenavInstance = null
    delete this._el.sidenavInstance

    this._el = null
    this._horizontal = null
    this._animate = null
    this._accordion = null
    this._closeChildren = null
    this._showDropdownOnHover = null
    this._rtl = null
    this._onOpen = null
    this._onOpened = null
    this._onClose = null
    this._onClosed = null
    if (this._scrollbar) {
      this._scrollbar.destroy()
      this._scrollbar = null
    }
    this._inner = null
    this._prevBtn = null
    this._wrapper = null
    this._nextBtn = null
  }

  _getLink(el, toggle) {
    let found = []
    const selector = toggle ? 'sidenav-toggle' : 'sidenav-link'

    if (el.classList.contains(selector)) found = [el]
    else if (el.classList.contains('sidenav-item')) found = this._findChild(el, [selector])

    if (!found.length) throw new Error(`\`${selector}\` element not found.`)

    return found[0]
  }

  _getItem(el, toggle) {
    let item = null
    const selector = toggle ? 'sidenav-toggle' : 'sidenav-link'

    if (el.classList.contains('sidenav-item')) {
      if (this._findChild(el, [selector]).length) item = el
    } else if (el.classList.contains(selector)) {
      item = el.parentNode.classList.contains('sidenav-item') ? el.parentNode : null
    }

    if (!item) {
      throw new Error(`${toggle ? 'Toggable ' : ''}\`.sidenav-item\` element not found.`)
    }

    return item
  }

  _findUnopenedParent(item, closeChildren) {
    let tree = []
    let parentItem = null

    while (item) {
      if (item.classList.contains('disabled')) {
        parentItem = null
        tree = []
      } else {
        if (!item.classList.contains('open')) parentItem = item
        tree.push(item)
      }

      item = this._findParent(item, 'sidenav-item', false)
    }

    if (!parentItem) return null
    if (tree.length === 1) return parentItem

    tree = tree.slice(0, tree.indexOf(parentItem))

    for (let i = 0, l = tree.length; i < l; i++) {
      tree[i].classList.add('open')

      if (this._accordion) {
        let openedItems = this._findChild(tree[i].parentNode, ['sidenav-item', 'open'])

        for (let j = 0, k = openedItems.length; j < k; j++) {
          if (openedItems[j] === tree[i]) continue
          openedItems[j].classList.remove('open')

          if (closeChildren) {
            let openedChildren = openedItems[j].querySelectorAll('.sidenav-item.open')

            for (let x = 0, z = openedChildren.length; x < z; x++) {
              openedChildren[x].classList.remove('open')
            }
          }
        }
      }
    }

    return parentItem
  }

  _closeOther(item, closeChildren) {
    const opened = this._findChild(item.parentNode, ['sidenav-item', 'open'])

    for (let i = 0, l = opened.length; i < l; i++) {
      if (opened[i] !== item) this.close(opened[i], closeChildren, true)
    }
  }

  _toggleAnimation(open, item, closeChildren) {
    const toggleLink = this._getLink(item, true)
    const menu = this._findMenu(item)

    this._unbindAnimationEndEvent(item)

    const linkHeight = Math.round(toggleLink.getBoundingClientRect().height)

    item.style.overflow = 'hidden'

    const clearItemStyle = () => {
      item.classList.remove('sidenav-item-animating')
      item.classList.remove('sidenav-item-closing')
      item.style.overflow = null
      item.style.height = null

      if (!this._horizontal) this.update()
    }

    if (open) {
      item.style.height = `${linkHeight}px`
      item.classList.add('sidenav-item-animating')
      item.classList.add('open')

      this._bindAnimationEndEvent(item, () => {
        clearItemStyle()
        this._onOpened && this._onOpened(this, item, toggleLink, menu)
      })

      setTimeout(() => item.style.height = `${linkHeight + Math.round(menu.getBoundingClientRect().height)}px`, 50)
    } else {
      item.style.height = `${linkHeight + Math.round(menu.getBoundingClientRect().height)}px`
      item.classList.add('sidenav-item-animating')
      item.classList.add('sidenav-item-closing')

      this._bindAnimationEndEvent(item, () => {
        item.classList.remove('open')
        clearItemStyle()

        if (closeChildren) {
          const opened = item.querySelectorAll('.sidenav-item.open')
          for (let i = 0, l = opened.length; i < l; i++) opened[i].classList.remove('open')
        }

        this._onClosed && this._onClosed(this, item, toggleLink, menu)
      })

      setTimeout(() => item.style.height = `${linkHeight}px`, 50)
    }
  }

  _toggleDropdown(show, item, closeChildren) {
    const menu = this._findMenu(item)

    if (show) {
      const wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width)
      const position = this._innerPosition
      const itemOffset = this._getItemOffset(item)
      const itemWidth = Math.round(item.getBoundingClientRect().width)

      if ((itemOffset - DELTA) <= (-1 * position)) {
        this._innerPosition = -1 * itemOffset
      } else if ((itemOffset + position + itemWidth + DELTA) >= wrapperWidth) {
        if (itemWidth > wrapperWidth) {
          this._innerPosition = -1 * itemOffset
        } else {
          this._innerPosition = -1 * (itemOffset + itemWidth - wrapperWidth)
        }
      }

      item.classList.add('open')

      const menuWidth = Math.round(menu.getBoundingClientRect().width)

      if ((itemOffset + this._innerPosition + menuWidth) > wrapperWidth && menuWidth < wrapperWidth && menuWidth > itemWidth) {
        menu.style[this._rtl ? 'marginRight' : 'marginLeft'] = `-${menuWidth - itemWidth}px`
      }

      this._closeOther(item, closeChildren)
      this._updateSlider()
    } else {
      const toggle = this._findChild(item, ['sidenav-toggle'])

      toggle.length && toggle[0].removeAttribute('data-hover', 'true')
      item.classList.remove('open')
      menu.style[this._rtl ? 'marginRight' : 'marginLeft'] = null

      if (closeChildren) {
        const opened = menu.querySelectorAll('.sidenav-item.open')

        for (let i = 0, l = opened.length; i < l; i++) opened[i].classList.remove('open')
      }
    }
  }

  _slide(direction) {
    const wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width)
    const innerWidth = this._innerWidth
    let newPosition

    if (direction === 'next') {
      newPosition = this._getSlideNextPos()

      if (innerWidth + newPosition < wrapperWidth) {
        newPosition = wrapperWidth - innerWidth
      }
    } else {
      newPosition = this._getSlidePrevPos()

      if (newPosition > 0) newPosition = 0
    }

    this._innerPosition = newPosition
    this.update()
  }

  _getSlideNextPos() {
    const wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width)
    const position = this._innerPosition
    let curItem = this._inner.childNodes[0]
    let left = 0

    while(curItem) {
      if (curItem.tagName) {
        let curItemWidth = Math.round(curItem.getBoundingClientRect().width)

        if ((left + position - DELTA) <= wrapperWidth && (left + position + curItemWidth + DELTA) >= wrapperWidth) {
          if (curItemWidth > wrapperWidth && left === (-1 * position)) left += curItemWidth
          break
        }

        left += curItemWidth
      }

      curItem = curItem.nextSibling
    }

    return -1 * left
  }

  _getSlidePrevPos() {
    const wrapperWidth = Math.round(this._wrapper.getBoundingClientRect().width)
    const position = this._innerPosition
    let curItem = this._inner.childNodes[0]
    let left = 0

    while(curItem) {
      if (curItem.tagName) {
        let curItemWidth = Math.round(curItem.getBoundingClientRect().width)

        if ((left - DELTA) <= (-1 * position) && (left + curItemWidth + DELTA) >= (-1 * position)) {
          if (curItemWidth <= wrapperWidth) left = left + curItemWidth - wrapperWidth
          break
        }

        left += curItemWidth
      }

      curItem = curItem.nextSibling
    }

    return -1 * left
  }

  _getItemOffset(item) {
    let curItem = this._inner.childNodes[0]
    let left = 0

    while(curItem !== item) {
      if (curItem.tagName) {
        left += Math.round(curItem.getBoundingClientRect().width)
      }

      curItem = curItem.nextSibling
    }

    return left
  }

  _bindAnimationEndEvent(el, handler) {
    const cb = e => {
      if (e.target !== el) return
      this._unbindAnimationEndEvent(el)
      handler(e)
    }

    let duration = window.getComputedStyle(el).transitionDuration
    duration = parseFloat(duration) * (duration.indexOf('ms') !== -1 ? 1 : 1000)

    el._sideNavAnimationEndEventCb = cb
    TRANSITION_EVENTS.forEach(ev => el.addEventListener(ev, el._sideNavAnimationEndEventCb, false))

    el._sideNavAnimationEndEventTimeout = setTimeout(function() {
      cb({ target: el })
    }, duration + 50)
  }

  _unbindAnimationEndEvent(el) {
    const cb = el._sideNavAnimationEndEventCb

    if (el._sideNavAnimationEndEventTimeout) {
      clearTimeout(el._sideNavAnimationEndEventTimeout)
      el._sideNavAnimationEndEventTimeout = null
    }

    if (!cb) return

    TRANSITION_EVENTS.forEach(ev => el.removeEventListener(ev, cb, false))
    el._sideNavAnimationEndEventCb = null
  }

  _bindEvents() {
    this._evntElClick = (e) => {
      const toggleLink = e.target.classList.contains('sidenav-toggle') ?
        e.target :
        this._findParent(e.target, 'sidenav-toggle', false)

      if (toggleLink) {
        e.preventDefault()

        if (toggleLink.getAttribute('data-hover') !== 'true') {
          this.toggle(toggleLink)
        }
      }
    }
    this._el.addEventListener('click', this._evntElClick)

    this._evntWindowResize = () => {
      if (!this._horizontal) {
        this.update()
      } else if (this._lastWidth !== window.innerWidth) {
        this._lastWidth = window.innerWidth
        this.update()
      }
    }
    window.addEventListener('resize', this._evntWindowResize)

    if (this._horizontal) {
      this._evntPrevBtnClick = (e) => {
        e.preventDefault()
        if (this._prevBtn.classList.contains('disabled')) return
        this._slide('prev')
      }
      this._prevBtn.addEventListener('click', this._evntPrevBtnClick)

      this._evntNextBtnClick = (e) => {
        e.preventDefault()
        if (this._nextBtn.classList.contains('disabled')) return
        this._slide('next')
      }
      this._nextBtn.addEventListener('click', this._evntNextBtnClick)

      this._evntBodyClick = (e) => {
        if (!this._inner.contains(e.target) && this._el.querySelectorAll('.sidenav-inner > .sidenav-item.open').length) this.closeAll()
      }
      document.body.addEventListener('click', this._evntBodyClick)

      this._evntHorizontalElClick = (e) => {
        const link = e.target.classList.contains('sidenav-link') ? e.target : this._findParent(e.target, 'sidenav-link', false)
        if (link && !link.classList.contains('sidenav-toggle')) this.closeAll()
      }
      this._el.addEventListener('click', this._evntHorizontalElClick)

      if (this._showDropdownOnHover) {
        this._evntInnerMousemove = (e) => {
          let curItem = this._findParent(e.target, 'sidenav-item', false)
          let item = null

          while (curItem) {
            item = curItem
            curItem = this._findParent(curItem, 'sidenav-item', false)
          }

          if (item && !item.classList.contains('open')) {
            const toggle = this._findChild(item, ['sidenav-toggle'])

            if (toggle.length) {
              toggle[0].setAttribute('data-hover', 'true')
              this.open(toggle[0], this._closeChildren, true)

              setTimeout(() => {
                toggle[0].removeAttribute('data-hover')
              }, 500)
            }
          }
        }
        this._inner.addEventListener('mousemove', this._evntInnerMousemove)

        this._evntInnerMouseleave = (e) => {
          this.closeAll()
        }
        this._inner.addEventListener('mouseleave', this._evntInnerMouseleave)
      }
    }
  }

  _unbindEvents() {
    if (this._evntElClick) {
      this._el.removeEventListener('click', this._evntElClick)
      this._evntElClick = null
    }

    if (this._evntWindowResize) {
      window.removeEventListener('resize', this._evntWindowResize)
      this._evntWindowResize = null
    }

    if (this._evntPrevBtnClick) {
      this._prevBtn.removeEventListener('click', this._evntPrevBtnClick)
      this._evntPrevBtnClick = null
    }

    if (this._evntNextBtnClick) {
      this._nextBtn.removeEventListener('click', this._evntNextBtnClick)
      this._evntNextBtnClick = null
    }

    if (this._evntBodyClick) {
      document.body.removeEventListener('click', this._evntBodyClick)
      this._evntBodyClick = null
    }

    if (this._evntHorizontalElClick) {
      this._el.removeEventListener('click', this._evntHorizontalElClick)
      this._evntHorizontalElClick = null
    }

    if (this._evntInnerMousemove) {
      this._inner.removeEventListener('mousemove', this._evntInnerMousemove)
      this._evntInnerMousemove = null
    }

    if (this._evntInnerMouseleave) {
      this._inner.removeEventListener('mouseleave', this._evntInnerMouseleave)
      this._evntInnerMouseleave = null
    }
  }

  _findMenu(item) {
    let curEl = item.childNodes[0]
    let menu = null

    while (curEl && !menu) {
      if (curEl.classList && curEl.classList.contains('sidenav-menu')) menu = curEl
      curEl = curEl.nextSibling
    }

    if (!menu) throw new Error('Cannot find `.sidenav-menu` element for the current `.sidenav-toggle`')

    return menu
  }

  _isRoot(item) {
    return !this._findParent(item, 'sidenav-item', false)
  }

  _findParent(el, cls, throwError = true) {
    if (el.tagName.toUpperCase() === 'BODY') return null
    el = el.parentNode
    while (el.tagName.toUpperCase() !== 'BODY' && !el.classList.contains(cls)) {
      el = el.parentNode
    }

    el = el.tagName.toUpperCase() !== 'BODY' ? el : null

    if (!el && throwError) throw new Error(`Cannot find \`.${cls}\` parent element`)

    return el
  }

  _findChild(el, cls) {
    const items = el.childNodes
    const found = []

    for (let i = 0, l = items.length; i < l; i++) {
      if (items[i].classList) {
        let passed = 0

        for (let j = 0; j < cls.length; j++) {
          if (items[i].classList.contains(cls[j])) passed++
        }

        if (cls.length === passed) found.push(items[i])
      }
    }

    return found
  }

  _supportsTransitionEnd() {
    if (window.QUnit) {
      return false
    }

    const el = document.body || document.documentElement
    let result = false

    TRANSITION_PROPERTIES.forEach(evnt => {
      if (typeof el.style[evnt] !== 'undefined') result = true
    })

    return result
  }

  get _innerWidth() {
    const items = this._inner.childNodes
    let width = 0

    for (let i = 0, l = items.length; i < l; i++) {
      if (items[i].tagName) {
        width += Math.round(items[i].getBoundingClientRect().width)
      }
    }

    return width
  }

  get _innerPosition() {
    return parseInt(this._inner.style[this._rtl ? 'marginRight' : 'marginLeft'] || '0px')
  }

  set _innerPosition(value) {
    this._inner.style[this._rtl ? 'marginRight' : 'marginLeft'] = `${value}px`
    return value
  }
}

export { SideNav }
