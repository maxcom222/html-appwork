import style from './_theme-settings/_theme-settings.scss'
import markup from './_theme-settings/_theme-settings.html'
import themeItemMarkup from './_theme-settings/_theme-settings-theme-item.html'
import bgItemMarkup from './_theme-settings/_theme-settings-bg-item.html'

const DEFAULT_THEME = 1
const CSS_FILENAME_PATTERN = '%name%.css'
const CONTROLS = [
  'rtl',
  'material',
  'layoutPosition',
  'layoutNavbarFixed',
  'layoutFooterFixed',
  'layoutReversed',
  'navbarBg',
  'sidenavBg',
  'footerBg',
  'themes'
]
const DEFAULT_NAVBAR_BG = 'navbar-theme'
const DEFAULT_SIDENAV_BG = 'sidenav-theme'
const DEFAULT_FOOTER_BG = 'footer-theme'

class ThemeSettings {
  constructor({ cssPath, themesPath, cssFilenamePattern, controls, sidenavBgs, defaultSidenavBg, navbarBgs, defaultNavbarBg, footerBgs, defaultFooterBg, availableThemes, defaultTheme, pathResolver, onSettingsChange, lang }) {
    if (this._ssr) return
    if (!window.layoutHelpers) throw new Error('window.layoutHelpers required.')

    this.settings = {}
    this.settings.cssPath = cssPath
    this.settings.themesPath = themesPath
    this.settings.cssFilenamePattern = cssFilenamePattern || CSS_FILENAME_PATTERN
    this.settings.navbarBgs = navbarBgs || ThemeSettings.NAVBAR_BGS
    this.settings.defaultNavbarBg = defaultNavbarBg || DEFAULT_NAVBAR_BG
    this.settings.sidenavBgs = sidenavBgs || ThemeSettings.SIDENAV_BGS
    this.settings.defaultSidenavBg = defaultSidenavBg || DEFAULT_SIDENAV_BG
    this.settings.footerBgs = footerBgs || ThemeSettings.FOOTER_BGS
    this.settings.defaultFooterBg = defaultFooterBg || DEFAULT_FOOTER_BG
    this.settings.availableThemes = availableThemes || ThemeSettings.AVAILABLE_THEMES
    this.settings.defaultTheme = this._getDefaultTheme(typeof defaultTheme !== 'undefined' ? defaultTheme : DEFAULT_THEME)
    this.settings.controls = controls || CONTROLS
    this.settings.lang = lang || 'en'
    this.pathResolver = pathResolver || (p => p)

    this.settings.onSettingsChange = typeof onSettingsChange === 'function' ? onSettingsChange : () => {}

    this._loadSettings()

    this._listeners = []
    this._controls = {}

    this._initDirection()
    this._initStyle()
    this._initTheme()
    this.setLayoutPosition(this.settings.layoutPosition, false)
    this.setLayoutNavbarFixed(this.settings.layoutNavbarFixed, false)
    this.setLayoutFooterFixed(this.settings.layoutFooterFixed, false)
    this.setLayoutReversed(this.settings.layoutReversed, false)
    this._setup()

    this._waitForNavs()
  }

  setRtl(rtl) {
    if (!this._hasControls('rtl')) return
    this._setSetting('Rtl', String(rtl))
    window.location.reload()
  }

  setMaterial(material) {
    if (!this._hasControls('material')) return
    this._setSetting('Material', String(material))
    window.location.reload()
  }

  setTheme(themeName, updateStorage = true, cb = null) {
    if (!this._hasControls('themes')) return

    const theme = this._getThemeByName(themeName)

    if (!theme) return;

    this.settings.theme = theme
    if (updateStorage) this._setSetting('Theme', themeName)

    const themeUrl = this.pathResolver(
      this.settings.themesPath + this.settings.cssFilenamePattern.replace('%name%', themeName + (this.settings.material ? '-material' : ''))
    )

    this._loadStylesheets(
      { [themeUrl]: document.querySelector('.theme-settings-theme-css') },
      cb || (() => {})
    )

    if (updateStorage) this.settings.onSettingsChange.call(this, this.settings)
  }

  setLayoutPosition(pos, updateStorage = true) {
    if (!this._hasControls('layoutPosition')) return
    if (pos !== 'static' && pos !== 'static-offcanvas' && pos !== 'fixed' && pos !== 'fixed-offcanvas') return

    this.settings.layoutPosition = pos
    if (updateStorage) this._setSetting('LayoutPosition', pos)

    window.layoutHelpers.setPosition(
      pos === 'fixed' || pos === 'fixed-offcanvas',
      pos === 'static-offcanvas' || pos === 'fixed-offcanvas'
    )

    if (updateStorage) this.settings.onSettingsChange.call(this, this.settings)
  }

  setLayoutNavbarFixed(fixed, updateStorage = true) {
    if (!this._hasControls('layoutNavbarFixed')) return
    this.settings.layoutNavbarFixed = fixed
    if (updateStorage) this._setSetting('FixedNavbar', fixed)

    window.layoutHelpers.setNavbarFixed(fixed)

    if (updateStorage) this.settings.onSettingsChange.call(this, this.settings)
  }

  setLayoutFooterFixed(fixed, updateStorage = true) {
    if (!this._hasControls('layoutFooterFixed')) return
    this.settings.layoutFooterFixed = fixed
    if (updateStorage) this._setSetting('FixedFooter', fixed)

    window.layoutHelpers.setFooterFixed(fixed)

    if (updateStorage) this.settings.onSettingsChange.call(this, this.settings)
  }

  setLayoutReversed(reversed, updateStorage = true) {
    if (!this._hasControls('layoutReversed')) return
    this.settings.layoutReversed = reversed
    if (updateStorage) this._setSetting('LayoutReversed', reversed)

    window.layoutHelpers.setReversed(reversed)

    if (updateStorage) this.settings.onSettingsChange.call(this, this.settings)
  }

  setNavbarBg(bg, updateStorage = true, _container = document) {
    if (!this._hasControls('navbarBg')) return
    if (this.settings.navbarBgs.indexOf(bg) === -1) return

    this.settings.navbarBg = bg
    if (updateStorage) this._setSetting('NavbarBg', bg)

    const navbar = _container.querySelector('.layout-navbar.navbar, .layout-navbar .navbar')

    if (!navbar) return

    navbar.className = navbar.className.replace(/^bg\-[^ ]+| bg\-[^ ]+/ig, '')
    navbar.classList.remove('navbar-light')
    navbar.classList.remove('navbar-dark')

    const classes = bg.split(' ')
    navbar.classList.add(`bg-${classes[0]}`)
    for (let i = 1, l = classes.length; i < l; i++) navbar.classList.add(classes[i])

    if (updateStorage) this.settings.onSettingsChange.call(this, this.settings)
  }

  setSidenavBg(bg, updateStorage = true, _container = document) {
    if (!this._hasControls('sidenavBg')) return
    if (this.settings.sidenavBgs.indexOf(bg) === -1) return

    this.settings.sidenavBg = bg
    if (updateStorage) this._setSetting('SidenavBg', bg)

    const sidenav = _container.querySelector('.layout-sidenav.sidenav, .layout-sidenav .sidenav, .layout-sidenav-horizontal.sidenav, .layout-sidenav-horizontal .sidenav')

    if (!sidenav) return

    sidenav.className = sidenav.className.replace(/^bg\-[^ ]+| bg\-[^ ]+/ig, '')
    sidenav.classList.remove('sidenav-light')
    sidenav.classList.remove('sidenav-dark')

    let classes = bg.split(' ')

    if (sidenav.classList.contains('sidenav-horizontal')) {
      classes = classes.join(' ').replace(' sidenav-dark', '').replace(' sidenav-light', '').split(' ')
      classes[0] = classes[0].replace(/-darke?r?$/, '')
    }

    sidenav.classList.add(`bg-${classes[0]}`)
    for (let i = 1, l = classes.length; i < l; i++) sidenav.classList.add(classes[i])

    if (updateStorage) this.settings.onSettingsChange.call(this, this.settings)
  }

  setFooterBg(bg, updateStorage = true, _container = document) {
    if (!this._hasControls('footerBg')) return
    if (this.settings.footerBgs.indexOf(bg) === -1) return

    this.settings.footerBg = bg
    if (updateStorage) this._setSetting('FooterBg', bg)

    const footer = _container.querySelector('.layout-footer.footer, .layout-footer .footer')

    if (!footer) return

    footer.className = footer.className.replace(/^bg\-[^ ]+| bg\-[^ ]+/ig, '')
    footer.classList.remove('footer-light')
    footer.classList.remove('footer-dark')

    const classes = bg.split(' ')
    footer.classList.add(`bg-${classes[0]}`)
    for (let i = 1, l = classes.length; i < l; i++) footer.classList.add(classes[i])

    if (updateStorage) this.settings.onSettingsChange.call(this, this.settings)
  }

  setLang(lang, force = false) {
    if (lang === this.settings.lang && !force) return
    if (!ThemeSettings.LANGUAGES[lang]) throw new Error(`Language "${lang}" not found!`)

    const t = ThemeSettings.LANGUAGES[lang]

    ;[
      'panel_header', 'rtl_switcher', 'material_switcher', 'layout_header', 'layout_static',
      'layout_offcanvas', 'layout_fixed', 'layout_fixed_offcanvas', 'layout_navbar_swicher',
      'layout_footer_swicher', 'layout_reversed_swicher', 'navbar_bg_header', 'sidenav_bg_header',
      'footer_bg_header', 'theme_header'
    ].forEach(key => {
      const el = this.container.querySelector(`.theme-settings-t-${key}`)
      el && (el.textContent = t[key])
    })

    const tt = t.themes || {}
    const themes = this.container.querySelectorAll('.theme-settings-theme-item') || []

    for (let i = 0, l = themes.length; i < l; i++) {
      const themeName = themes[i].querySelector('input[type="radio"]').value
      themes[i].querySelector('.theme-settings-theme-name').textContent = tt[themeName] || this._getThemeByName(themeName).title
    }

    this.settings.lang = lang
  }

  update() {
    if (this._ssr) return

    const hasNavbar = !!document.querySelector('.layout-navbar')
    const hasSidenav = !!document.querySelector('.layout-sidenav')
    const hasHorizontalSidenav = !!document.querySelector('.layout-sidenav-horizontal.sidenav, .layout-sidenav-horizontal .sidenav')
    const isLayout1 = !!document.querySelector('.layout-wrapper.layout-1')
    const hasFooter = !!document.querySelector('.layout-footer')

    if (this._controls.layoutReversed) {

      if (!hasSidenav) {
        this._controls.layoutReversed.setAttribute('disabled', 'disabled')
        this._controls.layoutReversedW.classList.add('disabled')
      } else {
        this._controls.layoutReversed.removeAttribute('disabled')
        this._controls.layoutReversedW.classList.remove('disabled')
      }

    }

    if (this._controls.layoutNavbarFixed) {

      if (!hasNavbar) {
        this._controls.layoutNavbarFixed.setAttribute('disabled', 'disabled')
        this._controls.layoutNavbarFixedW.classList.add('disabled')
      } else {
        this._controls.layoutNavbarFixed.removeAttribute('disabled')
        this._controls.layoutNavbarFixedW.classList.remove('disabled')
      }

    }

    if (this._controls.layoutFooterFixed) {

      if (!hasFooter) {
        this._controls.layoutFooterFixed.setAttribute('disabled', 'disabled')
        this._controls.layoutFooterFixedW.classList.add('disabled')
      } else {
        this._controls.layoutFooterFixed.removeAttribute('disabled')
        this._controls.layoutFooterFixedW.classList.remove('disabled')
      }

    }

    if (this._controls.layoutPosition) {

      if (!hasSidenav) {
        this._controls.layoutPosition.querySelector('[value="static-offcanvas"]').setAttribute('disabled', 'disabled')
        this._controls.layoutPosition.querySelector('[value="fixed-offcanvas"]').setAttribute('disabled', 'disabled')
      } else {
        this._controls.layoutPosition.querySelector('[value="static-offcanvas"]').removeAttribute('disabled')
        this._controls.layoutPosition.querySelector('[value="fixed-offcanvas"]').removeAttribute('disabled')
      }

      if ((!hasNavbar && !hasSidenav) || (!hasSidenav && !isLayout1)) {
        this._controls.layoutPosition.setAttribute('disabled', 'disabled')
      } else {
        this._controls.layoutPosition.removeAttribute('disabled')
      }

    }

    if (this._controls.navbarBgWInner) {

      if (!hasNavbar) {
        this._controls.navbarBgWInner.setAttribute('disabled', 'disabled')
      } else {
        this._controls.navbarBgWInner.removeAttribute('disabled')
      }

    }

    if (this._controls.sidenavBgWInner) {
      const items = Array.prototype.slice.call(document.querySelectorAll('.theme-settings-sidenavBg-inner .theme-settings-bg-item'))

      if (!hasSidenav && !hasHorizontalSidenav) {
        items.forEach(item => {
          item.classList.add('disabled')
          item.querySelector('input').setAttribute('disabled', 'disabled')
        })
      } else {
        items.forEach(item => {
          item.classList.remove('disabled')
          item.querySelector('input').removeAttribute('disabled')
        })

        if (hasHorizontalSidenav) items.forEach(item => {
          if (!/-darke?r?/.test(item.className) || /bg-dark/.test(item.className)) return
          item.classList.add('disabled')
          item.querySelector('input').setAttribute('disabled', 'disabled')
        })
      }

    }

    if (this._controls.footerBgWInner) {

      if (!hasFooter) {
        this._controls.footerBgWInner.setAttribute('disabled', 'disabled')
      } else {
        this._controls.footerBgWInner.removeAttribute('disabled')
      }

    }
  }

  updateNavbarBg(_container = document) {
    this.setNavbarBg(this.settings.navbarBg, false, _container)
  }

  updateSidenavBg(_container = document) {
    this.setSidenavBg(this.settings.sidenavBg, false, _container)
  }

  updateFooterBg(_container = document) {
    this.setFooterBg(this.settings.footerBg, false, _container)
  }

  clearLocalStorage() {
    if (this._ssr) return

    this._setSetting('Theme', '')
    this._setSetting('Rtl', '')
    this._setSetting('Material', '')
    this._setSetting('LayoutReversed', '')
    this._setSetting('FixedNavbar', '')
    this._setSetting('FixedFooter', '')
    this._setSetting('LayoutPosition', '')
    this._setSetting('NavbarBg', '')
    this._setSetting('SidenavBg', '')
    this._setSetting('FooterBg', '')
  }

  destroy() {
    if (this._ssr) return

    this._cleanup()

    this.settings = null
    this.container.parentNode.removeChild(this.container)
    this.container = null
  }

  _loadSettings() {
    const cl = document.documentElement.classList
    const rtl = this._getSetting('Rtl')
    const material = this._getSetting('Material')
    const reversed = this._getSetting('LayoutReversed')
    const fixedNavbar = this._getSetting('FixedNavbar')
    const fixedFooter = this._getSetting('FixedFooter')
    const navbarBg = this._getSetting('NavbarBg')
    const sidenavBg = this._getSetting('SidenavBg')
    const footerBg = this._getSetting('FooterBg')
    const lPosition = this._getSetting('LayoutPosition')
    let position

    if (lPosition !== '' && ['static', 'static-offcanvas', 'fixed', 'fixed-offcanvas'].indexOf(lPosition) !== -1) {
      position = lPosition
    } else if (cl.contains('layout-offcanvas')) {
      position = 'static-offcanvas'
    } else if (cl.contains('layout-fixed')) {
      position = 'fixed'
    } else if (cl.contains('layout-fixed-offcanvas')) {
      position = 'fixed-offcanvas'
    } else {
      position = 'static'
    }

    // Set settings

    this.settings.rtl = rtl !== '' ? rtl === 'true' : document.documentElement.getAttribute('dir') === 'rtl'
    this.settings.material = material !== '' ? material === 'true' : cl.contains('material-style')
    this.settings.layoutPosition = position
    this.settings.layoutReversed = reversed !== '' ? reversed === 'true' : cl.contains('layout-reversed')
    this.settings.layoutNavbarFixed = fixedNavbar !== '' ? fixedNavbar === 'true' : cl.contains('layout-navbar-fixed')
    this.settings.layoutFooterFixed = fixedFooter !== '' ? fixedFooter === 'true' : cl.contains('layout-footer-fixed')
    this.settings.navbarBg = this.settings.navbarBgs.indexOf(navbarBg) !== -1 ? navbarBg : this.settings.defaultNavbarBg
    this.settings.sidenavBg = this.settings.sidenavBgs.indexOf(sidenavBg) !== -1 ? sidenavBg : this.settings.defaultSidenavBg
    this.settings.footerBg = this.settings.footerBgs.indexOf(footerBg) !== -1 ? footerBg : this.settings.defaultFooterBg
    this.settings.theme = this._getThemeByName(this._getSetting('Theme'), true)

    // Filter options depending on available controls
    if (!this._hasControls('rtl')) this.settings.rtl = document.documentElement.getAttribute('dir') === 'rtl'
    if (!this._hasControls('material')) this.settings.material = cl.contains('material-style')
    if (!this._hasControls('layoutPosition')) this.settings.layoutPosition = null
    if (!this._hasControls('layoutReversed')) this.settings.layoutReversed = null
    if (!this._hasControls('layoutNavbarFixed')) this.settings.layoutNavbarFixed = null
    if (!this._hasControls('layoutFooterFixed')) this.settings.layoutFooterFixed = null
    if (!this._hasControls('navbarBg')) this.settings.navbarBg = null
    if (!this._hasControls('sidenavBg')) this.settings.sidenavBg = null
    if (!this._hasControls('footerBg')) this.settings.footerBg = null
    if (!this._hasControls('themes')) this.settings.theme = null
  }

  _setup(_container = document) {
    this._cleanup()
    this.container = this._getElementFromString(markup)

    // Open btn
    //

    const openBtn = this.container.querySelector('.theme-settings-open-btn')
    const openBtnCb = () => {
      this.container.classList.add('theme-settings-open')
      this.update()

      if (this._updateInterval) clearInterval(this._updateInterval)
      this._updateInterval = setInterval(() => {
        this.update()
      }, 1000)
    }
    openBtn.addEventListener('click', openBtnCb)
    this._listeners.push([ openBtn, 'click', openBtnCb ])

    // Close btn
    //

    const closeBtn = this.container.querySelector('.theme-settings-close-btn')
    const closeBtnCb = () => {
      this.container.classList.remove('theme-settings-open')

      if (this._updateInterval) {
        clearInterval(this._updateInterval)
        this._updateInterval = null
      }
    }
    closeBtn.addEventListener('click', closeBtnCb)
    this._listeners.push([ closeBtn, 'click', closeBtnCb ])

    // RTL
    //

    const rtlW = this.container.querySelector('.theme-settings-rtl')

    if (!this._hasControls('rtl')) {
      rtlW.parentNode.removeChild(rtlW)

    } else {
      const rtl = rtlW.querySelector('input')

      if (this.settings.rtl) rtl.setAttribute('checked', 'checked')

      const rtlCb = e => {
        this._loadingState(true)
        this.setRtl(e.target.checked)
      }

      rtl.addEventListener('change', rtlCb)
      this._listeners.push([ rtl, 'change', rtlCb ])
    }

    // Material
    //

    const materialW = this.container.querySelector('.theme-settings-material')

    if (!this._hasControls('material')) {
      materialW.parentNode.removeChild(materialW)

    } else {
      const material = materialW.querySelector('input')

      if (this.settings.material) material.setAttribute('checked', 'checked')

      const materialCb = e => {
        this._loadingState(true)
        this.setMaterial(e.target.checked)
      }

      material.addEventListener('change', materialCb)
      this._listeners.push([ material, 'change', materialCb ])
    }

    // Layout wrapper
    //

    const layoutW = this.container.querySelector('.theme-settings-layout')

    if (!this._hasControls('layoutPosition layoutNavbarFixed layoutFooterFixed layoutReversed', true)) {
      layoutW.parentNode.removeChild(layoutW)

    } else {

      // Position
      //

      const layoutPositionW = this.container.querySelector('.theme-settings-layoutPosition')

      if (!this._hasControls('layoutPosition')) {
        layoutPositionW.parentNode.removeChild(layoutPositionW)

      } else {
        this._controls.layoutPosition = layoutPositionW.querySelector('select')

        this._controls.layoutPosition.value = this.settings.layoutPosition

        const layoutPositionCb = e => this.setLayoutPosition(e.target.value)
        this._controls.layoutPosition.addEventListener('change', layoutPositionCb)
        this._listeners.push([ this._controls.layoutPosition, 'change', layoutPositionCb ])
      }

      // Navbar
      //

      this._controls.layoutNavbarFixedW = this.container.querySelector('.theme-settings-layoutNavbarFixed')

      if (!this._hasControls('layoutNavbarFixed')) {
        this._controls.layoutNavbarFixedW.parentNode.removeChild(this._controls.layoutNavbarFixedW)

      } else {
        this._controls.layoutNavbarFixed = this._controls.layoutNavbarFixedW.querySelector('input')

        if (this.settings.layoutNavbarFixed) this._controls.layoutNavbarFixed.setAttribute('checked', 'checked')

        const layoutNavbarFixedCb = e => this.setLayoutNavbarFixed(e.target.checked)
        this._controls.layoutNavbarFixed.addEventListener('change', layoutNavbarFixedCb)
        this._listeners.push([ this._controls.layoutNavbarFixed, 'change', layoutNavbarFixedCb ])
      }

      // Footer
      //

      this._controls.layoutFooterFixedW = this.container.querySelector('.theme-settings-layoutFooterFixed')

      if (!this._hasControls('layoutFooterFixed')) {
        this._controls.layoutFooterFixedW.parentNode.removeChild(this._controls.layoutFooterFixedW)

      } else {
        this._controls.layoutFooterFixed = this._controls.layoutFooterFixedW.querySelector('input')

        if (this.settings.layoutFooterFixed) this._controls.layoutFooterFixed.setAttribute('checked', 'checked')

        const layoutFooterFixedCb = e => this.setLayoutFooterFixed(e.target.checked)
        this._controls.layoutFooterFixed.addEventListener('change', layoutFooterFixedCb)
        this._listeners.push([ this._controls.layoutFooterFixed, 'change', layoutFooterFixedCb ])
      }

      // Reversed
      //

      this._controls.layoutReversedW = this.container.querySelector('.theme-settings-layoutReversed')

      if (!this._hasControls('layoutReversed')) {
        this._controls.layoutReversedW.parentNode.removeChild(this._controls.layoutReversedW)

      } else {
        this._controls.layoutReversed = this._controls.layoutReversedW.querySelector('input')

        if (this.settings.layoutReversed) this._controls.layoutReversed.setAttribute('checked', 'checked')

        const layoutReversedCb = e => this.setLayoutReversed(e.target.checked)
        this._controls.layoutReversed.addEventListener('change', layoutReversedCb)
        this._listeners.push([ this._controls.layoutReversed, 'change', layoutReversedCb ])
      }

    }

    // Navbar Bg
    //

    const navbarBgW = this.container.querySelector('.theme-settings-navbarBg')

    if (!this._hasControls('navbarBg')) {
      navbarBgW.parentNode.removeChild(navbarBgW)

    } else {
      this._controls.navbarBgWInner = navbarBgW.querySelector('.theme-settings-navbarBg-inner')

      this.settings.navbarBgs.forEach(bg => {
        const bgItem = this._getElementFromString(bgItemMarkup)
        const control = bgItem.querySelector('input')

        bgItem.classList.add(`bg-${bg.split(' ')[0]}`)
        control.name = 'theme-settings-navbarBg-input'
        control.value = bg

        if (this.settings.navbarBg === bg) {
          control.setAttribute('checked', 'checked')
          bgItem.classList.add('active')
        }

        const cb = e => {
          const items = this._controls.navbarBgWInner.querySelectorAll('.theme-settings-bg-item')
          for (let i = 0, l = items.length; i < l; i++) items[i].classList.remove('active')

          e.target.parentNode.classList.add('active')
          this.setNavbarBg(e.target.value)
        }

        control.addEventListener('change', cb)
        this._listeners.push([ control, 'change', cb ])
        this._controls.navbarBgWInner.appendChild(bgItem)
      })
    }

    // Sidenav Bg
    //

    const sidenavBgW = this.container.querySelector('.theme-settings-sidenavBg')

    if (!this._hasControls('sidenavBg')) {
      sidenavBgW.parentNode.removeChild(sidenavBgW)

    } else {
      this._controls.sidenavBgWInner = sidenavBgW.querySelector('.theme-settings-sidenavBg-inner')

      this.settings.sidenavBgs.forEach(bg => {
        const bgItem = this._getElementFromString(bgItemMarkup)
        const control = bgItem.querySelector('input')

        bgItem.classList.add(`bg-${bg.split(' ')[0]}`)
        control.name = 'theme-settings-sidenavBg-input'
        control.value = bg

        if (this.settings.sidenavBg === bg) {
          control.setAttribute('checked', 'checked')
          bgItem.classList.add('active')
        }

        const cb = e => {
          const items = this._controls.sidenavBgWInner.querySelectorAll('.theme-settings-bg-item')
          for (let i = 0, l = items.length; i < l; i++) items[i].classList.remove('active')

          e.target.parentNode.classList.add('active')
          this.setSidenavBg(e.target.value)
        }

        control.addEventListener('change', cb)
        this._listeners.push([ control, 'change', cb ])
        this._controls.sidenavBgWInner.appendChild(bgItem)
      })
    }

    // Footer Bg
    //

    const footerBgW = this.container.querySelector('.theme-settings-footerBg')

    if (!this._hasControls('footerBg')) {
      footerBgW.parentNode.removeChild(footerBgW)

    } else {
      this._controls.footerBgWInner = footerBgW.querySelector('.theme-settings-footerBg-inner')

      this.settings.footerBgs.forEach(bg => {
        const bgItem = this._getElementFromString(bgItemMarkup)
        const control = bgItem.querySelector('input')

        bgItem.classList.add(`bg-${bg.split(' ')[0]}`)
        control.name = 'theme-settings-footerBg-input'
        control.value = bg

        if (this.settings.footerBg === bg) {
          control.setAttribute('checked', 'checked')
          bgItem.classList.add('active')
        }

        const cb = e => {
          const items = this._controls.footerBgWInner.querySelectorAll('.theme-settings-bg-item')
          for (let i = 0, l = items.length; i < l; i++) items[i].classList.remove('active')

          e.target.parentNode.classList.add('active')
          this.setFooterBg(e.target.value)
        }

        control.addEventListener('change', cb)
        this._listeners.push([ control, 'change', cb ])
        this._controls.footerBgWInner.appendChild(bgItem)
      })
    }

    // Themes
    //

    const themesW = this.container.querySelector('.theme-settings-themes')

    if (!this._hasControls('themes')) {
      themesW.parentNode.removeChild(themesW)

    } else {
      const themesWInner = this.container.querySelector('.theme-settings-themes-inner')

      // SETUP THEMES

      this.settings.availableThemes.forEach(theme => {
        const themeItem = this._getElementFromString(themeItemMarkup)
        const control = themeItem.querySelector('input')

        control.value = theme.name

        if (this.settings.theme.name === theme.name) {
          control.setAttribute('checked', 'checked')
        }

        themeItem.querySelector('.theme-settings-theme-colors').innerHTML = `
          <span style="background: ${theme.colors.primary}"></span>
          <span style="background: ${theme.colors.navbar}"></span>
          <span style="background: ${theme.colors.sidenav}"></span>
        `

        const cb = e => {
          if (this._loading) return

          this._loading = true
          this._loadingState(true, true)

          this.setTheme(e.target.value, true, () => {
            this._loading = false
            this._loadingState(false, true)
          })
        }

        control.addEventListener('change', cb)
        this._listeners.push([ control, 'change', cb ])
        themesWInner.appendChild(themeItem)
      })

    }

    // Set language
    this.setLang(this.settings.lang, true)

    // Append container
    if (_container === document) {
      if (_container.body) {
        _container.body.appendChild(this.container)
      } else {
        window.addEventListener('DOMContentLoaded', () => _container.body.appendChild(this.container))
      }
    } else {
      _container.appendChild(this.container)
    }
  }

  _initDirection() {
    if (this._hasControls('rtl')) document.documentElement.setAttribute('dir', this.settings.rtl ? 'rtl' : 'ltr')
  }

  _initStyle() {
    if (!this._hasControls('material')) return

    const material = this.settings.material

    this._insertStylesheet('theme-settings-bootstrap-css', this.pathResolver(
      this.settings.cssPath + this.settings.cssFilenamePattern.replace('%name%', 'bootstrap' + (material ? '-material' : ''))
    ))
    this._insertStylesheet('theme-settings-appwork-css', this.pathResolver(
      this.settings.cssPath + this.settings.cssFilenamePattern.replace('%name%', 'appwork' + (material ? '-material' : ''))
    ))
    this._insertStylesheet('theme-settings-colors-css', this.pathResolver(
      this.settings.cssPath + this.settings.cssFilenamePattern.replace('%name%', 'colors' + (material ? '-material' : ''))
    ))

    document.documentElement.classList.remove(material ? 'default-style' : 'material-style')
    document.documentElement.classList.add(material ? 'material-style' : 'default-style')

    if (material && window.attachMaterialRipple) {
      if (document.body) {
        window.attachMaterialRipple()
      } else {
        window.addEventListener('DOMContentLoaded', () => window.attachMaterialRipple())
      }
    }
  }

  _initTheme() {
    if (this._hasControls('themes')) {
      this._insertStylesheet('theme-settings-theme-css', this.pathResolver(
        this.settings.themesPath + this.settings.cssFilenamePattern.replace('%name%', this.settings.theme.name + (this.settings.material ? '-material' : ''))
      ))
    }
  }

  _insertStylesheet(className, href) {
    const curLink = document.querySelector(`.${className}`)

    if (typeof document.documentMode === 'number' && document.documentMode < 11) {
      if (!curLink) return
      if (href === curLink.getAttribute('href')) return

      const link = document.createElement('link')

      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('type', 'text/css')
      link.className = className
      link.setAttribute('href', href)

      curLink.parentNode.insertBefore(link, curLink.nextSibling)
    } else {
      document.write(`<link rel="stylesheet" type="text/css" href="${href}" class="${className}">`)
    }

    curLink.parentNode.removeChild(curLink)
  }

  _loadStylesheets(stylesheets, cb) {
    const paths = Object.keys(stylesheets)
    const count = paths.length
    let loaded = 0

    function loadStylesheet(path, curLink, _cb) {
      const link = document.createElement('link')

      link.setAttribute('href', path)
      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('type', 'text/css')
      link.className = curLink.className

      const sheet = 'sheet' in link ? 'sheet' : 'styleSheet'
      const cssRules = 'sheet' in link ? 'cssRules' : 'rules'

      let timeoutId, intervalId

      timeoutId = setTimeout(function() {
        clearInterval(intervalId)
        clearTimeout(timeoutId)
        curLink.parentNode.removeChild(link)
        _cb(false, path);
      }, 15000 )

      intervalId = setInterval(function() {
        try {
          if (link[sheet] && link[sheet][cssRules].length) {
            clearInterval(intervalId)
            clearTimeout(timeoutId)
            curLink.parentNode.removeChild(curLink)
            _cb(true)
          }
        } catch(e) {
          console.error(e)
        } finally {}
      }, 10)

      curLink.parentNode.insertBefore(link, curLink.nextSibling)
    }

    for (let i = 0; i < paths.length; i++) {
      loadStylesheet(paths[i], stylesheets[paths[i]], function(success, errPath) {
        if (!success) {
          if (console && typeof console.error === 'function') { console.error('Error occured while loading stylesheets!'); }
          alert('Error occured while loading stylesheets!');
          console.log(errPath)
        }

        if (++loaded >= count) {
          cb()
        }
      })
    }
  }

  _loadingState(enable, themes) {
    this.container.classList[enable ? 'add' : 'remove'](`theme-settings-loading${themes ? '-theme' : ''}`)
  }

  _waitForNavs() {
    this._addObserver(
      '.layout-navbar.navbar, .layout-navbar .navbar',
      node => {
        return node && node.classList && node.classList.contains('layout-navbar') && (
          node.classList.contains('navbar') || node.querySelector('.navbar')
        )
      },
      () => this.setNavbarBg(this.settings.navbarBg, false)
    )

    this._addObserver(
      '.layout-sidenav.sidenav, .layout-sidenav .sidenav, .layout-sidenav-horizontal.sidenav, .layout-sidenav-horizontal .sidenav',
      node => {
        return node && node.classList && (
          (node.classList.contains('layout-sidenav') || node.classList.contains('layout-sidenav-horizontal')) && (
            node.classList.contains('sidenav') || node.querySelector('.sidenav')
          )
        )
      },
      () => this.setSidenavBg(this.settings.sidenavBg, false)
    )

    this._addObserver(
      '.layout-footer.footer, .layout-footer .footer',
      node => {
        return node && node.classList && node.classList.contains('layout-footer') && (
          node.classList.contains('footer') || node.querySelector('.footer')
        )
      },
      () => this.setFooterBg(this.settings.footerBg, false)
    )

    if (!document.body && ((this._observers && this._observers.length) || (this._intervals && this._intervals.length))) {
      const loadCb = () => {
        this._clearObservers()
        this.setNavbarBg(this.settings.navbarBg, false)
        this.setSidenavBg(this.settings.sidenavBg, false)
        this.setFooterBg(this.settings.footerBg, false)
        window.removeEventListener('load', loadCb)
      }
      window.addEventListener('load', loadCb)
    }
  }

  _addObserver(selector, condition, cb) {
    if (!this._observers) this._observers = []
    if (!this._intervals) this._intervals = []
    let _observer;
    let _interval;

    if (document.querySelector(selector)) {
      cb.call(this)
    } else if (!document.body) {
      if (typeof MutationObserver !== 'undefined') {
        _observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (!mutation.addedNodes) return

            for (let i = 0; i < mutation.addedNodes.length; i++) {
              let node = mutation.addedNodes[i]

              if (condition.call(this, node)) {
                _observer.disconnect()
                this._observers.splice(this._observers.indexOf(_observer), 1)
                _observer = null
                cb.call(this)
                break
              }
            }
          })
        })
        this._observers.push(_observer)

        _observer.observe(document.documentElement, {
          childList: true, subtree: true, attributes: false, characterData: false
        })
      } else {
        _interval = setInterval(() => {
          if (document.querySelector(selector)) {
            clearInterval(_interval)
            this._intervals.splice(this._intervals.indexOf(_interval), 1)
            _interval = null
            cb.call(this)
          }
        }, 10)
        this._intervals.push(_interval)
      }
    }
  }

  _clearObservers() {
    if (this._observers && this._observers.length) {
      for (let i = 0, l = this._observers.length; i < l; i++) {
        this._observers[i].disconnect()
      }
    }

    if (this._intervals && this._intervals.length) {
      for (let j = 0, k = this._intervals.length; j < k; j++) {
        clearInterval(this._intervals[j])
      }
    }

    this._observers = null
    this._intervals = null
  }

  _getElementFromString(str) {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = str
    return wrapper.firstChild
  }

  _getSetting(key) {
    let result = null
    try { result = localStorage.getItem(`themeSettings${key}`) } catch (e) {}
    return String(result || '')
  }

  _setSetting(key, val) {
    try { localStorage.setItem(`themeSettings${key}`, String(val)) } catch (e) {}
  }

  _removeListeners() {
    for (let i = 0, l = this._listeners.length; i < l; i++) {
      this._listeners[i][0].removeEventListener(this._listeners[i][1], this._listeners[i][2])
    }
  }

  _cleanup() {
    this._removeListeners()
    this._listeners = []
    this._controls = {}

    this._clearObservers()

    if (this._updateInterval) {
      clearInterval(this._updateInterval)
      this._updateInterval = null
    }
  }

  get _ssr() {
    return typeof window === 'undefined'
  }

  _hasControls(controls, oneOf = false) {
    return controls.split(' ').reduce((result, control) => {
      if (this.settings.controls.indexOf(control) !== -1) {
        if (oneOf || result !== false) result = true
      } else {
        if (!oneOf || result !== true) result = false
      }
      return result
    }, null)
  }

  _getDefaultTheme(themeId) {
    let theme

    if (typeof themeId === 'string') {
      theme = this._getThemeByName(themeId, false)
    } else {
      theme = this.settings.availableThemes[themeId]
    }

    if (!theme) {
      throw new Error(`Theme ID "${themeId}" not found!`)
    }

    return theme
  }

  _getThemeByName(themeName, returnDefault = false) {
    const themes = this.settings.availableThemes

    for (var i = 0, l = themes.length; i < l; i++) {
      if (themes[i].name === themeName) return themes[i]
    }

    return returnDefault ? this.settings.defaultTheme : null
  }
}

ThemeSettings.AVAILABLE_THEMES = [
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
]

ThemeSettings.NAVBAR_BGS = [
  'navbar-theme',
  'primary',
  'primary-dark navbar-dark',
  'primary-darker navbar-dark',
  'secondary',
  'secondary-dark navbar-dark',
  'secondary-darker navbar-dark',
  'success',
  'success-dark navbar-dark',
  'success-darker navbar-dark',
  'info',
  'info-dark navbar-dark',
  'info-darker navbar-dark',
  'warning',
  'warning-dark navbar-light',
  'warning-darker navbar-light',
  'danger',
  'danger-dark navbar-dark',
  'danger-darker navbar-dark',
  'dark',
  'white',
  'light',
  'lighter'
]

ThemeSettings.SIDENAV_BGS = [
  'sidenav-theme',
  'primary',
  'primary-dark sidenav-dark',
  'primary-darker sidenav-dark',
  'secondary',
  'secondary-dark sidenav-dark',
  'secondary-darker sidenav-dark',
  'success',
  'success-dark sidenav-dark',
  'success-darker sidenav-dark',
  'info',
  'info-dark sidenav-dark',
  'info-darker sidenav-dark',
  'warning',
  'warning-dark sidenav-light',
  'warning-darker sidenav-light',
  'danger',
  'danger-dark sidenav-dark',
  'danger-darker sidenav-dark',
  'dark',
  'white',
  'light',
  'lighter'
]

ThemeSettings.FOOTER_BGS = [
  'footer-theme',
  'primary',
  'primary-dark footer-dark',
  'primary-darker footer-dark',
  'secondary',
  'secondary-dark footer-dark',
  'secondary-darker footer-dark',
  'success',
  'success-dark footer-dark',
  'success-darker footer-dark',
  'info',
  'info-dark footer-dark',
  'info-darker footer-dark',
  'warning',
  'warning-dark footer-light',
  'warning-darker footer-light',
  'danger',
  'danger-dark footer-dark',
  'danger-darker footer-dark',
  'dark',
  'white',
  'light',
  'lighter'
]

ThemeSettings.LANGUAGES = {
  en: {
    panel_header: 'SETTINGS',
    rtl_switcher: 'RTL direction',
    material_switcher: 'Material style',
    layout_header: 'LAYOUT',
    layout_static: 'Static',
    layout_offcanvas: 'Offcanvas',
    layout_fixed: 'Fixed',
    layout_fixed_offcanvas: 'Fixed offcanvas',
    layout_navbar_swicher: 'Fixed navbar',
    layout_footer_swicher: 'Fixed footer',
    layout_reversed_swicher: 'Reversed',
    navbar_bg_header: 'NAVBAR BACKGROUND',
    sidenav_bg_header: 'SIDENAV BACKGROUND',
    footer_bg_header: 'FOOTER BACKGROUND',
    theme_header: 'THEME'
  }
}

export { ThemeSettings }
