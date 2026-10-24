const path = require('path')

module.exports = {
  name: 'navigation-aware-active-header-links',
  clientRootMixin: path.resolve(__dirname, 'clientRootMixin.js'),
  enhanceAppFiles: path.resolve(__dirname, 'scrollBehavior.js'),
  define: {
    AHL_SIDEBAR_LINK_SELECTOR: '.sidebar-link',
    AHL_HEADER_ANCHOR_SELECTOR: '.header-anchor'
  }
}
