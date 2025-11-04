<script setup lang="ts">
  import { shallowRef, onMounted, nextTick, watch, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useCustomizerStore } from '../../../stores/customizer';
  import sidebarItems from './sidebarItem';

  import NavGroup from './NavGroup/NavGroup.vue';
  import NavItem from './NavItem/NavItem.vue';
  import NavCollapse from './NavCollapse/NavCollapse.vue';
  // import ExtraBox from './extrabox/ExtraBox.vue';
  import Logo from '../logo/LogoMain.vue';

  const customizer = useCustomizerStore();
  const sidebarMenu = shallowRef(sidebarItems);
  const route = useRoute();

  const version = import.meta.env.VITE_APP_VERSION;

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  function getScrollableAncestor(el: Element | null): HTMLElement | null {
    let node = el as HTMLElement | null;
    while (node && node !== document.body) {
      const style = window.getComputedStyle(node);
      const oy = style.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) return node;
      node = node.parentElement;
    }
    return (document.querySelector('.scrollnavbar') as HTMLElement)
      || (document.querySelector('.ps__rail-y') as HTMLElement)
      || (document.querySelector('.leftSidebar') as HTMLElement)
      || document.body;
  }

  async function scrollToActiveMenu() {
    await nextTick();

    const MAX_RETRIES = 8;
    const RETRY_DELAY = 80;

    for (let i = 0; i < MAX_RETRIES; i++) {
      const activeEl = document.querySelector('.v-list-item--active') || document.querySelector('.is-active');
      if (!activeEl) {
        await sleep(RETRY_DELAY);
        continue;
      }

      const sc = getScrollableAncestor(activeEl);
      if (!sc) {
        await sleep(RETRY_DELAY);
        continue;
      }

      if (sc.scrollHeight <= sc.clientHeight) {
        await sleep(RETRY_DELAY);
        continue;
      }

      const activeRect = (activeEl as HTMLElement).getBoundingClientRect();
      const scRect = sc.getBoundingClientRect();
      const offsetWithinContainer = activeRect.top - scRect.top;
      const targetScrollTop = sc.scrollTop + offsetWithinContainer - (sc.clientHeight / 2) + ((activeEl as HTMLElement).clientHeight / 2);

      try {
        (sc as any).scrollTo?.({ top: targetScrollTop, behavior: 'smooth' });
        sc.scrollTop = targetScrollTop;
      } catch {
        sc.scrollTop = targetScrollTop;
      }

      break;
    }
  }

  onMounted(() => {
    scrollToActiveMenu();
    window.addEventListener('load', scrollToActiveMenu);
  });

  watch(
    () => route.fullPath,
    () => {
      scrollToActiveMenu();
    }
  );

  onUnmounted(() => {
    window.removeEventListener('load', scrollToActiveMenu);
  });

  /* console */
  function runSidebarDebug() {
    const active = document.querySelector('.v-list-item--active') || document.querySelector('.is-active');
    const sc = active ? getScrollableAncestor(active) : document.querySelector('.scrollnavbar');
    return {
      activeEl: active,
      scrollContainer: sc,
      scrollHeight: sc?.scrollHeight,
      clientHeight: sc?.clientHeight,
      isScrollable: !!sc && sc!.scrollHeight > sc!.clientHeight
    };
  }
</script>

<template>
  <v-navigation-drawer left v-model="customizer.Sidebar_drawer" elevation="0" rail-width="75" mobile-breakpoint="lg" app class="leftSidebar" :rail="customizer.mini_sidebar" expand-on-hover>
    <!---Logo part -->

    <div class="pa-5">
      <Logo />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-4">
        <!---Menu Loop -->
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <!---Item Sub Header -->
          <NavGroup :item="item" v-if="item.header" :key="item.title" />
          <!---Item Divider -->
          <v-divider class="my-3" v-else-if="item.divider" />
          <!---If Has Child -->
          <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
          <!---Single Item-->
          <NavItem :item="item" v-else class="leftPadding" />
          <!---End Single Item-->
        </template>
      </v-list>
      <div class="pa-4">
        <!-- <ExtraBox /> -->
        <!-- move with User Information or something here -->
      </div>
      <!-- <div class="pa-4 text-center">
        <v-chip color="inputBorder" size="small"> {{ 'v' + version }} </v-chip>
      </div> -->
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>
