<script setup lang="ts">
  import { router } from '@/router';
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
  import { RouterView } from 'vue-router';
  import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
  import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
  import Customizer from './customizer/CustomizerPanel.vue';
  import FooterPanel from './footer/FooterPanel.vue';
  import { useCustomizerStore } from '../../stores/customizer';
  const customizer = useCustomizerStore();

  import ModalDialogMessages from '@/components/shared/ModalDialog.vue';
  import { useModalStore } from '@/stores/components/modal';
  const modal = useModalStore();

  import ModalConfirmationMessages from '@/components/shared/ConfirmationDialog.vue';
  import { useConfirmStore } from '@/stores/components/confirmation';
  const confirm = useConfirmStore();

  import IsUsernameIsset from '@/components/apps/IsUsernameIsset.vue';
  const showUsernameDialog = ref(false);
  import { useAuthStore } from '@/stores/auth';
  const authStore = useAuthStore();

  onMounted(() => {
    if (!authStore.user?.userData?.username) {
      showUsernameDialog.value = true
    }

    const interval = setInterval(() => {
      const loggedIn = authStore.checkSession();

      if (!loggedIn) {
        (async () => {
          try {
            await confirm.open('Anda harus login untuk melanjutkan di InstaApp');
            router.push('/login');
          } catch {
          }
        })();
      }
    }, 10000);

    onUnmounted(() => clearInterval(interval));
  });


  watch(
    () => authStore.user?.userData,
    (value) => {
      if (!value) {
        router.push('/login');
      }
    },
    { immediate: true }
  )

  watch(
    () => authStore.user?.userData?.username,
    (value) => {
      if (!value) {
        showUsernameDialog.value = true
      }
    },
    { immediate: true }
  )
</script>

<template>
  <v-locale-provider>
    <v-app theme="LightBlueTheme" :class="[customizer.fontTheme, customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.inputBg ? 'inputWithbg' : '']">
      <Customizer />
      <VerticalSidebarVue />
      <VerticalHeaderVue />

      <v-main>
        <v-container fluid class="page-wrapper">
          <div>
            <ModalConfirmationMessages v-model="confirm.confirmDialogActive" :message="confirm.confirmDialogText" />
            <ModalDialogMessages v-model="modal.messageDialogActive" :message="modal.messageDialogText" />
            <IsUsernameIsset v-model="showUsernameDialog" />
            <RouterView />
            <!-- <v-btn class="customizer-btn" size="large" icon variant="flat" color="primary" @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)">
              <SettingsIcon class="icon" />
            </v-btn> -->
          </div>
        </v-container>
        <v-container fluid class="pt-0">
          <div>
            <FooterPanel />
          </div>
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>
