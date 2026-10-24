<script>
import NavLinks from '@vuepress/theme-default/components/NavLinks.vue'
import NavLink from '@vuepress/theme-default/components/NavLink.vue'

// The URL is the source of truth, including refreshes, direct links and browser history.
export default {
  extends: NavLinks,

  components: {
    NavLink: {
      extends: NavLink,
      computed: {
        exact () {
          return this.link === '/python/' || NavLink.computed.exact.call(this)
        }
      }
    }
  },

  computed: {
    framework () {
      const language = this.$route.path.startsWith('/python/') ? 'python' : 'golang'
      return this.$site.themeConfig.frameworks[language]
    },

    userNav () {
      return [
        {
          text: this.framework.label,
          ariaLabel: '切换框架语言',
          items: [
            { text: 'Golang', link: '/' },
            { text: 'Python', link: '/python/' }
          ]
        },
        ...this.framework.nav
      ]
    },

    repoLink () {
      return this.framework.repo
    }
  }
}
</script>
