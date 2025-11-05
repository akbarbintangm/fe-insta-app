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

  import { useModalStore } from '@/stores/components/modal';
  const modal = useModalStore();

</script>

<template>
  <v-dialog v-model="internalDialog" max-width="500">
    <!-- ACTIVATOR -->
    <!-- <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" color="surface-variant" text="Open Dialog" variant="flat" />
    </template> -->

    <!-- CONTENT -->
    <v-card title="Notifications">
      <v-card-text>
        {{ modal.messageDialogText }}
      </v-card-text>

      <v-card-actions class="my-2">
        <v-spacer></v-spacer>

        <v-btn text="Close" color="secondary" variant="flat" @click="close" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
