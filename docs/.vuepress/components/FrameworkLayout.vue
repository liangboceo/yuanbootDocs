<script>
import Layout from '@vuepress/theme-default/layouts/Layout.vue'
import { resolveMatchingConfig } from '@vuepress/theme-default/util'

// VuePress 1 resolves sidebar pages but drops fragments from configured links.
function preserveFragments (items, config) {
  return items.map((item, index) => {
    const source = config[index]
    const path = typeof source === 'string'
      ? source
      : Array.isArray(source) ? source[0] : source.path
    const hash = path && path.match(/#.*$/)
    const result = { ...item }
    if (hash && result.path) result.path += hash[0]
    if (source.children && result.children) {
      result.children = preserveFragments(result.children, source.children)
    }
    return result
  })
}

export default {
  extends: Layout,
  computed: {
    sidebarItems () {
      const items = Layout.computed.sidebarItems.call(this)
      if (!this.$route.path.startsWith('/python/')) return items
      const { config } = resolveMatchingConfig(
        this.$page.regularPath,
        this.$site.themeConfig.sidebar
      )
      return Array.isArray(config) ? preserveFragments(items, config) : items
    }
  }
}
</script>
