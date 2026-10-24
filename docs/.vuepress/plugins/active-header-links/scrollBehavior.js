export default ({ Vue, router }) => {
  let cancelPendingScroll = () => {}
  router.beforeEach((to, from, next) => {
    cancelPendingScroll()
    next()
  })

  router.options.scrollBehavior = (to, from, savedPosition) => {
    cancelPendingScroll()
    if (savedPosition) {
      window.scrollTo({ left: savedPosition.x || 0, top: savedPosition.y, behavior: 'auto' })
      return false
    }

    if (to.hash) {
      if (Vue.$vuepress.$get('disableScrollBehavior')) return false
      // Chinese and punctuation in a URL fragment are IDs, not CSS selectors.
      const id = decodeURIComponent(to.hash.slice(1))
      const scrollToHeading = () => {
        const target = document.getElementById(id)
        if (!target) return false
        target.scrollIntoView({ behavior: to.path === from.path ? 'smooth' : 'auto' })
        return true
      }

      if (scrollToHeading()) return false

      // On a direct visit, the async page can mount after the router is ready.
      const observer = new MutationObserver(() => {
        if (scrollToHeading()) cancelPendingScroll()
      })
      const timeout = window.setTimeout(() => cancelPendingScroll(), 5000)
      cancelPendingScroll = () => {
        observer.disconnect()
        window.clearTimeout(timeout)
      }
      observer.observe(document.body, { childList: true, subtree: true })
    } else {
      window.scrollTo({ left: 0, top: 0, behavior: 'auto' })
    }
    return false
  }
}
