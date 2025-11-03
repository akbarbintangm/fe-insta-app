<template>
  <v-progress-linear v-if="pageLoadingState.isLoading" indeterminate color="primary" height="3" absolute top />
  <v-overlay :model-value="pageLoadingState.isLoading" persistent class="overlay-loading d-flex align-center justify-center" scrim>
    <div class="d-flex flex-column align-center justify-center text-center">
      <v-progress-circular indeterminate color="primary" size="56" width="5" />
      <span class="mt-3 text-white text-subtitle-2">Loading...</span>
    </div>
  </v-overlay>
  <!-- <RouterView /> -->
  <!-- <transition name="fade" mode="out-in">
    <RouterView />
  </transition> -->
  <transition name="fade" mode="out-in">
    <component :is="!pageLoadingState.isLoading ? RouterView : null" />
  </transition>
</template>

<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import { pageLoadingState } from '@/utils/helpers/page-loading'
</script>

<style scoped>
  .overlay-loading {
    backdrop-filter: blur(1px);
    background-color: rgba(255, 255, 255, 0.2);
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
  }

  .v-theme--dark .overlay-loading {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
