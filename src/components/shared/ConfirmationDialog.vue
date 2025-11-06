<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    messagesValue: {
      type: String,
      default: ''
    },
    confirmValue: {
      type: String,
      default: 'Confirm'
    }
  })

  const isLoading = ref(false);

  const emit = defineEmits(['update:modelValue'])
  const internalDialog = ref(props.modelValue)
  watch(() => props.modelValue, (v) => {
    internalDialog.value = v
  })

  function close() {
    internalDialog.value = false
    emit('update:modelValue', false)
  }

  import { useConfirmStore } from '@/stores/components/confirmation';
  const confirm = useConfirmStore();

</script>

<template>
  <v-dialog persistent elevation="4" v-model="internalDialog" max-width="500">
    <!-- CONTENT -->
    <v-card title="Notifications" elevation="4">
      <v-card-text>
        {{ confirm.confirmDialogText }}
      </v-card-text>

      <v-card-actions class="my-2">
        <v-spacer></v-spacer>

        <v-btn text="Cancel" color="danger" variant="flat" @click="close" />
        <v-btn :text="confirm.confirmDialogConfirmText" color="primary" variant="flat" :loading="isLoading" @click="confirm.confirm()" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
