window.paceOptions = { startOnPageLoad: false }

import * as Pace from 'pace-js/pace.js'

function appendStylesheets() {
  if (document.getElementById('pace-js-stylesheets')) return

  const style = document.createElement('style')

  style.type = 'text/css'
  style.id = 'pace-js-stylesheets'
  style.innerHTML = `
  .pace {
    display: block !important;
  }
  .page-loader {
    display: none;
    position: fixed;
    height: 2px;
    overflow: hidden;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
  }
  .page-loader div {
    position: absolute;
    top: 0;
    bottom: 0;
    transform: translate3d(0, 0, 0);
  }
  .pace-running:not(.pace-done) .page-loader {
    display: block;
  }
  .pace-running:not(.pace-done) .page-loader div {
    animation-duration: 1.2s;
    animation-name: pageLoaderAnimation;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }
  .turbolinks-progress-bar {
    visibility: hidden !important;
  }
  [dir=rtl] .pace-running:not(.pace-done) .page-loader div,
  [dir=rtl].pace-running:not(.pace-done) .page-loader div {
    animation-name: pageLoaderAnimationRTL;
  }
  @-webkit-keyframes pageLoaderAnimation {
    0% { right: 100%; left: 0; }
    40% { right: 0; left: 0; }
    60% { left: 0; right: 0; }
    100% { left: 100%; right: 0; }
  }
  @keyframes pageLoaderAnimation {
    0% { right: 100%; left: 0; }
    40% { right: 0; left: 0; }
    60% { left: 0; right: 0; }
    100% { left: 100%; right: 0; }
  }
  @-webkit-keyframes pageLoaderAnimationRTL {
    0% { left: 100%; right: 0; }
    40% { left: 0; right: 0; }
    60% { right: 0; left: 0; }
    100% { right: 100%; left: 0; }
  }
  @keyframes pageLoaderAnimationRTL {
    0% { left: 100%; right: 0; }
    40% { left: 0; right: 0; }
    60% { right: 0; left: 0; }
    100% { right: 100%; left: 0; }
  }
  `

  document.querySelector('head').appendChild(style)
}

appendStylesheets()

Pace.start()

// Ensure that Pace.js will be hidden on page loaded

function hidePaceLoader() {
  setTimeout(function() {
    Pace.stop()
  }, 3000)
}

if (document.readyState === 'complete') hidePaceLoader()
else document.addEventListener('DOMContentLoaded', hidePaceLoader)
