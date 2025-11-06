<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { createPostStore } from '@/stores/components/createpost'
  import { UploadIcon } from 'vue-tabler-icons'
  import { useModalStore } from '@/stores/components/modal'
  const modal = useModalStore()
  import { useConfirmStore } from '@/stores/components/confirmation';
  const confirm = useConfirmStore();

  // Props & emits
  const props = defineProps({
    modelValue: { type: Boolean, default: false }
  })
  const emit = defineEmits(['update:modelValue'])

  // Internal dialog state
  const internalDialog = ref(props.modelValue)
  watch(() => props.modelValue, (v) => internalDialog.value = v)

  function close() {
    internalDialog.value = false
    emit('update:modelValue', false)
  }

  // Post store
  const createPost = createPostStore()

  // Post type & media
  const postType = ref<'text' | 'media'>('text')
  const caption = ref('')
  const mediaFiles = ref<File[]>([])
  const mediaType = ref('')

  // Typed ref for file input
  const fileInput = ref<HTMLInputElement>()

  // Valid extensions using Set
  const imageExt = new Set(['jpg', 'jpeg', 'png'])
  const videoExt = new Set(['mp4', 'mov', 'avi'])

  // Helper to check file type
  function getFileType(file: File): 'image' | 'video' | null {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext) return null
    if (imageExt.has(ext)) return 'image'
    if (videoExt.has(ext)) return 'video'
    return null
  }

  // Process single file only and validate type
  function processFiles(files: File[]) {
    if (files.length > 1) {
      modal.messageDialogText = 'Hanya bisa upload 1 file saja'
      modal.messageDialogActive = true
      return
    }

    const file = files[0]
    if (!file) return

    const type = getFileType(file)
    if (!type) {
      modal.messageDialogText = `File tidak valid. Hanya bisa upload: jpg, jpeg, png, mp4, mov, avi`
      modal.messageDialogActive = true
      return
    }

    mediaFiles.value = [file]
    mediaType.value = type === 'image' ? 'image' : 'video'
  }

  // Drag & drop handlers
  function handleDrop(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer?.files) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
  }

  function handleFileSelect(e: Event) {
    const files = (e.target as HTMLInputElement).files
    if (files) processFiles(Array.from(files))
  }

  // Trigger file input click
  function triggerFileSelect() {
    fileInput.value?.click()
  }

  const isLoading = ref(false);

  async function submitPost() {
    isLoading.value = false;
    try {
      await confirm.open("Yakin ingin untuk post?", "Submit Post");
      isLoading.value = true
      await createPost.post(
        postType.value,
        caption.value,
        mediaFiles.value,
        mediaType.value
      )
        .then((message) => {
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
      modal.messageDialogText = error
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <v-dialog persistent elevation="4" v-model="internalDialog" max-width="500">
    <v-card title="Create a New Post" elevation="4">
      <v-card-text class="space-y-4">
        <!-- Toggle post type -->
        <v-btn-toggle v-model="postType" mandatory class="mb-4">
          <v-btn class="mr-2" value="text">Post Text</v-btn>
          <v-btn value="media">Post Upload Media</v-btn>
        </v-btn-toggle>

        <!-- Custom Drag & Drop area -->
        <div v-if="postType === 'media'" class="custom-drop-area" @drop="handleDrop" @dragover="handleDragOver" @click="triggerFileSelect">
          <UploadIcon class="w-8 h-8 text-gray-500 mb-2" />
          <p class="text-gray-500">Drag & drop 1 file di sini atau klik untuk browse</p>
          <input hidden ref="fileInput" type="file" multiple class="hidden" @change="handleFileSelect" accept=".jpg,.jpeg,.png,.mp4" />
          <div v-if="mediaFiles.length" class="mt-2">
            <div class="text-sm text-gray-700">{{ mediaFiles[0]?.name }}</div>
            <div class="text-xs text-gray-500 mt-1">
              Media type: {{ mediaType || 'none' }}
            </div>
          </div>
        </div>

        <!-- Caption -->
        <v-textarea v-model="caption" :class="postType === 'media' ? 'mt-6' : ''" :label="postType === 'media' ? 'Caption' : 'Post Text'" density="comfortable" hide-details="auto"
                    variant="outlined" />
      </v-card-text>

      <v-card-actions class="my-2">
        <v-spacer />
        <v-btn text color="secondary" @click="close">Close</v-btn>
        <v-btn color="primary" @click="submitPost" :disabled="postType === 'media' && !mediaFiles.length">
          Post
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
  .custom-drop-area {
    border: 2px dashed #b0bec5;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;
  }

  .custom-drop-area:hover {
    border-color: #1976d2;
    background-color: #f5f5f5;
  }
</style>
