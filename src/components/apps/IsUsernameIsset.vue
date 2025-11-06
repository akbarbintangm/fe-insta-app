<script setup lang="ts">
  import { ref, watch, computed } from 'vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:modelValue'])
  const internalDialog = ref(props.modelValue)
  watch(() => props.modelValue, (v) => {
    internalDialog.value = v
  })

  function close() {
    internalDialog.value = false
    emit('update:modelValue', false)
  }

  const username = ref('');
  import { useAuthStore } from '@/stores/auth';
  const authStore = useAuthStore()
  import { useUsernameStore } from '@/stores/apps/username';
  const usernameStore = useUsernameStore();
  import { useModalStore } from '@/stores/components/modal';
  const modal = useModalStore();

  import ModalConfirmationMessages from '@/components/shared/ConfirmationDialog.vue';
  import { useConfirmStore } from '@/stores/components/confirmation';
  const confirm = useConfirmStore();

  const isLoading = ref(false)

  async function validate() {
    isLoading.value = false;
    try {
      if (!isUsernameValid.value) return;
      await confirm.open("Yakin ingin untuk rename username? Aksi ini akan dilakukan logout guna refresh credential.", "Change Username & Logout Now");
      isLoading.value = true
      await usernameStore.save(username.value)
        .then((message) => {
          // authStore.refresh();
          authStore.logout();
          close();
          modal.messageDialogActive = true
          modal.messageDialogText = message;
        })
        .catch((error) => {
          modal.messageDialogActive = true
          modal.messageDialogText = error
        })
        .finally(() => {
          isLoading.value = false
        })
    } catch (error: any) {
      modal.messageDialogActive = true
      modal.messageDialogText = error
    } finally {
      isLoading.value = false;
    }
  }

  const isUsernameFormatValid = computed(() => {
    const pattern = /^[a-zA-Z0-9._]+$/;
    return pattern.test(username.value) && username.value.length >= 3;
  });

  const isUsernameAvailable = ref(true);

  let debounceTimer: number | undefined;

  watch(username, async (val) => {
    clearTimeout(debounceTimer);

    debounceTimer = window.setTimeout(async () => {

      if (!isUsernameFormatValid.value) {
        isUsernameAvailable.value = false;
        return;
      }

      isLoading.value = true;
      try {
        await usernameStore.fetchUsername(val);
        isUsernameAvailable.value = true;
      } catch (error: any) {
        isUsernameAvailable.value = false;
        modal.messageDialogActive = true;
        modal.messageDialogText = error;
      } finally {
        isLoading.value = false;
      }

    }, 500);
  });


  const isUsernameValid = computed(() => {
    return isUsernameFormatValid.value && isUsernameAvailable.value;
  });


</script>

<template>
  <ModalConfirmationMessages v-model="confirm.confirmDialogActive" :message="confirm.confirmDialogText" />

  <v-dialog elevation="4" persistent v-model="internalDialog" max-width="500">
    <!-- CONTENT -->
    <v-card title="Penggantian Username" elevation="4">
      <v-card-text>
        Username Anda masih belum diset. Silahkan masukkan username yang Anda inginkan sebelum melanjutkan InstaApp.
        <v-text-field :disabled="isLoading" v-model="username" label="New Username" required density="comfortable" hide-details="auto" variant="outlined" color="primary" class="mt-8"
                      :error="username.length > 0 && !isUsernameValid" :error-messages="username.length > 0 && !isUsernameValid
                        ? (!isUsernameFormatValid
                          ? 'Format salah: hanya huruf, angka, underscore, titik.'
                          : null)
                        : null
                        " :success="username.length > 0 && isUsernameValid" :success-messages="username.length > 0 && isUsernameValid
                          ? 'Username tersedia'
                          : null
                          " />
        <span v-if="!isLoading && username.length > 0 && isUsernameValid" style="font-size: 12px; font-weight: light" class="text-success ms-4">{{ 'Username tersedia' }}</span>
        <span v-else-if="!isLoading && username.length > 0 && !isUsernameValid" style="font-size: 12px; font-weight: light; color: red;" class="text-danger ms-4">{{ 'Username sudah dipakai.' }}</span>
        <span v-else="debounceTimer && isLoading" style="font-size: 12px; font-weight: light" class="text-secondary ms-4">{{ 'Searching...' }}</span>

      </v-card-text>

      <v-card-actions class="my-2">
        <v-spacer></v-spacer>

        <v-btn text="Nanti Saja" color="secondary" variant="flat" @click="close" />
        <v-btn text="Save Username" color="primary" variant="flat" :loading="isLoading" :disabled="!isUsernameValid" @click="validate" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>