import style from 'node-waves/dist/waves.css'
import Waves from 'node-waves/dist/waves.js'

function isElementWithRipple(el) {
  const cls = (el.className || '').split(' ')

  return (
    cls.indexOf('btn') !== -1 ||
    cls.indexOf('page-link') !== -1 ||
    cls.indexOf('dropdown-item') !== -1 ||
    (
      el.tagName &&
      el.tagName.toUpperCase() === 'A' &&
      el.parentNode.tagName.toUpperCase() === 'LI'
      && (
        el.parentNode.parentNode.className.indexOf('dropdown-menu') !== -1 ||
        el.parentNode.parentNode.className.indexOf('pagination') !== -1
      )
    )
  )
}

function getElementWithRipple(target) {
  if (!target) return null
  if (typeof target.className.indexOf !== 'function' || target.className.indexOf('waves-effect') !== -1) return null
  if (isElementWithRipple(target)) return target

  let el = target.parentNode

  while (el && el.tagName.toUpperCase() !== 'BODY' && el.className.indexOf('waves-effect') === -1) {
    if (isElementWithRipple(el)) return el
    el = el.parentNode
  }

  return null
}

function attachWaves(e) {
  if (e.button === 2) return

  const el = getElementWithRipple(e.target)

  el && Waves.attach(el)
}

function attachMaterialRipple() {
  if (typeof window === 'undefined') return
  if (typeof document['documentMode'] === 'number' && document['documentMode'] < 11) return

  document.body.addEventListener('mousedown', attachWaves, false)

  if ('ontouchstart' in window) document.body.addEventListener('touchstart', attachWaves, false)

  Waves.init({ duration: 500 })
}

function attachMaterialRippleOnLoad() {
  if (document.body) {
    attachMaterialRipple()
  } else {
    window.addEventListener('DOMContentLoaded', function windowOnLoad() {
      attachMaterialRipple()
      window.removeEventListener('DOMContentLoaded', windowOnLoad)
    })
  }
}

function detachMaterialRipple() {
  if (typeof window === 'undefined' || !document.body) return
  if (typeof document['documentMode'] === 'number' && document['documentMode'] < 11) return

  document.body.removeEventListener('mousedown', attachWaves, false)

  if ('ontouchstart' in window) document.body.removeEventListener('touchstart', attachWaves, false)

  Waves.calm('.waves-effect')
}

export { attachMaterialRipple, attachMaterialRippleOnLoad, detachMaterialRipple }
