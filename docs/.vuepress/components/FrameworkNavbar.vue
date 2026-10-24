<template>
  <header class="navbar">
    <SidebarButton @toggle-sidebar="$emit('toggle-sidebar')" />

    <RouterLink :to="frameworkHome" class="home-link">
      <img
        v-if="$site.themeConfig.logo"
        class="logo"
        :src="$withBase($site.themeConfig.logo)"
        :alt="$siteTitle"
      >
      <span
        v-if="$siteTitle"
        ref="siteName"
        class="site-name"
        :class="{ 'can-hide': $site.themeConfig.logo }"
      >{{ $siteTitle }}</span>
    </RouterLink>

    <div
      class="links"
      :style="linksWrapMaxWidth ? { 'max-width': linksWrapMaxWidth + 'px' } : {}"
    >
      <AlgoliaSearchBox v-if="isAlgoliaSearch" :options="algolia" />
      <SearchBox v-else-if="$site.themeConfig.search !== false && $page.frontmatter.search !== false" />
      <NavLinks class="can-hide" />
    </div>
  </header>
</template>

<script>
import Navbar from '@vuepress/theme-default/components/Navbar.vue'

export default {
  extends: Navbar,

  computed: {
    frameworkHome () {
      return this.$route.path.startsWith('/python/') ? '/python/' : '/'
    }
  }
}
</script>
