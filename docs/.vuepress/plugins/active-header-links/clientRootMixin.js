import ActiveHeaderLinks from '@vuepress/plugin-active-header-links/clientRootMixin'

export default {
  extends: ActiveHeaderLinks,

  data () {
    return { isChangingPage: false }
  },

  mounted () {
    // The initial router scroll can run before the application is mounted.
    this.$nextTick(() => {
      if (this.$route.hash) {
        this.$router.options.scrollBehavior(this.$route, { path: '' }, null)
      }
    })

    this.removeHeaderNavigationGuard = this.$router.beforeEach((to, from, next) => {
      if (to.path !== from.path) {
        // A hash replacement on the old page would cancel the pending async route.
        this.isChangingPage = true
        ActiveHeaderLinks.methods.onScroll.cancel()
      }
      next()
    })

    this.removeHeaderNavigationHook = this.$router.afterEach(() => {
      ActiveHeaderLinks.methods.onScroll.cancel()
      this.$nextTick(() => {
        this.isChangingPage = false
      })
    })

    this.$router.onError(error => {
      this.isChangingPage = false
      console.error(error)
    })
  },

  methods: {
    setActiveHash () {
      if (!this.isChangingPage) {
        ActiveHeaderLinks.methods.setActiveHash.call(this)
      }
    }
  },

  beforeDestroy () {
    ActiveHeaderLinks.methods.onScroll.cancel()
    this.removeHeaderNavigationGuard()
    this.removeHeaderNavigationHook()
  }
}
