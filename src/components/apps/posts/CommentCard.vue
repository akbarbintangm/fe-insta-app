<script setup lang="ts">
  import { formatDate } from '@/utils/helpers/date-format';

  import { ref } from "vue"

  import { HeartIcon, MessageCircleIcon, SendIcon, UserIcon, TrashIcon } from 'vue-tabler-icons'

  const props = defineProps({
    index: { type: Number, required: true },
    data: { type: Object }
  })

  const emit = defineEmits(["comment-added"]);

  import { useModalStore } from '@/stores/components/modal';
  const modal = useModalStore();

  import { useConfirmStore } from '@/stores/components/confirmation';
  const confirm = useConfirmStore();

  import { useAuthStore } from '@/stores/auth';
  const authStore = useAuthStore();

  import { usePostStore } from '@/stores/apps/post';
  const postStore = usePostStore();

  const isLoading = ref(false);

  const commentReply = ref('');

  async function giveComment(id: string, comment: string) {
    isLoading.value = true;
    try {
      await postStore.giveComment(id, comment)
        .then((response) => {
          commentReply.value = "";
          emit("comment-added", id);
        })
        .catch((error) => {
          modal.messageDialogActive = true
          modal.messageDialogText = error
        })
        .finally(() => {
        })
    } catch (error: any) {
      modal.messageDialogActive = true
      modal.messageDialogText = error
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteComment(id: string, idComments: string) {

    try {
      await confirm.open("Yakin ingin untuk delete komentar ini?", "Delete Comment");
      isLoading.value = true;
      await postStore.deleteComment(id, idComments)
        .then((response) => {
          modal.messageDialogActive = true
          modal.messageDialogText = response
          emit("comment-added", id);
        })
        .catch((error) => {
          modal.messageDialogActive = true
          modal.messageDialogText = error
        })
        .finally(() => {
        })
    } catch (error: any) {
      modal.messageDialogActive = true
      modal.messageDialogText = error
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <aside class="comment-box">
    <v-card elevation="4" class="pa-4 comment-card">

      <!-- HEADER -->
      <h3 class="text-h6 font-weight-bold mb-3">
        {{ props.data?.comments?.length }} Komentar
      </h3>

      <v-divider class="mb-4" />

      <!-- SCROLL WRAPPER -->
      <div class="comment-scroll">

        <div class="comment-item">
          <!-- Avatar -->
          <UserIcon class="user-icon" />
          <!-- Text Block -->
          <div class="comment-body w-100" max-width="100%">
            <span class="username">{{ authStore.user.userData.username }}</span>
            <span class="content">
              <v-text-field width="100%" :disabled="isLoading" v-model="commentReply" label="Add Comments" required density="comfortable" hide-details="auto" variant="outlined" color="primary"
                            class="mt-2" @keydown.enter="giveComment(props.data?.id, commentReply)">
                <!-- BUTTON INSIDE INPUT -->
                <template #append-inner>
                  <v-btn icon size="small" :loading="isLoading" :disabled="!commentReply || isLoading" @click="giveComment(props.data?.id, commentReply)">
                    <SendIcon />
                  </v-btn>
                </template>
              </v-text-field>
            </span>
          </div>
        </div>

        <div v-for="(comment, i) in props.data?.comments" :key="i" class="comment-item">

          <UserIcon class="user-icon" />

          <!-- WRAP BODY + AGAR BUTTON BISA KE KANAN -->
          <div class="comment-body-container">
            <div class="comment-body">
              <span class="username">
                {{ comment.user?.username || 'Username' }} •
                <span class="font-weight-light text-subtitle-1" style="font-size: 12px !important;">
                  {{ formatDate(comment.created_at) }}
                </span>
              </span>
              <span class="content">{{ comment.comment }}</span>
            </div>
          </div>

          <v-btn v-if="comment?.user_id == authStore?.user?.userData?.id" color="secondary" variant="text" class="delete-btn" icon size="small" :loading="isLoading" :disabled="isLoading"
                 @click="deleteComment(props.data?.id, comment.id)">
            <TrashIcon />
          </v-btn>
        </div>
      </div>
    </v-card>
  </aside>
</template>


<style scoped>
  .comment-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 18px;
    justify-content: space-between;
  }

  .comment-body-container {
    flex: 1;
    margin-right: 10px;
  }

  .comment-box {
    height: 100%;
    display: flex;
  }

  .comment-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
  }

  /* Scroll Area */
  .comment-scroll {
    flex: 1;
    overflow-y: auto;
    padding-right: 6px;
  }

  /* Avatar */
  .user-icon {
    font-size: 26px;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .comment-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-width: 100%;
  }

  .username {
    font-weight: 600;
    color: #222;
    font-size: 0.92rem;
  }

  .content {
    color: #444;
    font-size: 0.9rem;
    line-height: 1.35;
    white-space: pre-line;
  }

  /* Scrollbar */
  .comment-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .comment-scroll::-webkit-scrollbar-thumb {
    background: #cfcfcf;
    border-radius: 10px;
  }

  .comment-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
</style>
