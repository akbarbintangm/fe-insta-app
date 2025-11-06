<script setup lang="ts">
  import { ref, computed } from "vue";

  const backEndURL = import.meta.env.VITE_API_URL + "/storage";

  // Tabler icons
  import { HeartIcon, MessageCircleIcon, UserIcon, UserPlusIcon, UserCheckIcon, TrashIcon } from 'vue-tabler-icons'

  const props = defineProps({
    index: { type: Number, required: true },
    data: { type: Object }
  })

  const emit = defineEmits(["toggle-comment", "post-deleted"])

  import { useModalStore } from '@/stores/components/modal';
  const modal = useModalStore();

  import { useConfirmStore } from '@/stores/components/confirmation';
  const confirm = useConfirmStore();

  import { useAuthStore } from '@/stores/auth';
  const authStore = useAuthStore();

  import { usePostStore } from '@/stores/apps/post';
  const postStore = usePostStore();

  const isLoading = ref(false);
  const showLove = ref(false);

  // ✅ userLiked diambil dari likes array dan tidak boleh di-set manual
  const userLiked = computed(() => {
    return props.data?.likes?.some(
      (like: any) => like.user_id === authStore?.user?.userData?.id
    )
  });

  // ✅ double tap untuk love
  async function onMediaDoubleClick(postId: string) {
    if (!userLiked.value) {
      showLove.value = true;
      setTimeout(() => showLove.value = false, 800);

      await toggleLikePost(postId);
    }
  }

  // ✅ toggle like (LIKE / UNLIKE)
  async function toggleLikePost(postId: string) {
    isLoading.value = true;

    try {
      if (!userLiked.value) {
        // ✅ request like
        await postStore.like(postId);

        // ✅ push like ke array props supaya reactive
        if (props.data && Array.isArray(props.data.likes)) {
          props.data.likes.push({
            user_id: authStore.user.userData.id,
            post_id: postId,
          });
        }

      } else {
        // ✅ request unlike
        await postStore.unlike(postId);

        // ✅ hapus dari array likes
        if (props.data && Array.isArray(props.data.likes)) {
          props.data.likes = props.data.likes.filter(
            (like: any) => like.user_id !== authStore.user.userData.id
          );
        }

      }

    } catch (error: any) {
      modal.messageDialogActive = true;
      modal.messageDialogText = error;

    } finally {
      isLoading.value = false;
    }
  }


  // ✅ update caption
  async function updatePost(id: string, caption: string) {
    isLoading.value = true;
    try {
      await postStore.update(id, caption);
    } catch (error: any) {
      modal.messageDialogActive = true;
      modal.messageDialogText = error;
    } finally {
      isLoading.value = false;
    }
  }

  // ✅ delete post
  async function deletePost(id: string) {
    try {
      await confirm.open("Yakin ingin untuk delete post ini?", "Delete Post");
      isLoading.value = true;
      await postStore.delete(id);
      emit("post-deleted", id);
    } catch (error: any) {
      modal.messageDialogActive = true;
      modal.messageDialogText = error;
    } finally {
      isLoading.value = false;
    }
  }

  const isFollowing = computed(() => {
    return authStore.user?.followingData?.some(
      (x: any) => x.following_id === props.data?.user_id
    );
  });

  async function toggleFollowUser(targetUserId: string) {
    isLoading.value = true;

    try {
      if (!isFollowing.value) {
        await postStore.follow(targetUserId);
        if (authStore.user && Array.isArray(authStore.user.followingData)) {
          authStore.user.followingData.push({
            user_id: authStore.user.userData.id,
            following_id: targetUserId,
          });
        }

      } else {
        await postStore.unfollow(targetUserId);
        if (authStore.user && Array.isArray(authStore.user.followingData)) {
          authStore.user.followingData = authStore.user.followingData.filter(
            (f: any) => f.following_id !== targetUserId
          );
        }
      }

      localStorage.setItem('user', JSON.stringify(authStore.user));

    } catch (error: any) {
      modal.messageDialogActive = true;
      modal.messageDialogText = error;

    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <v-card class="pa-4" elevation="4" rounded="md">
    <div class="d-flex align-center mb-3" style="width: 100%; justify-content: space-between;">
      <!-- <img :src="" height="35" width="35" class="rounded-sm" style="display: inline-flex; flex-shrink: 0;" />
       -->
      <div class="d-flex align-center" style="gap: 8px;">
        <UserIcon class="text-2xl" />
        <span class="font-weight-bold">{{ props.data?.user?.username }}</span>
      </div>

      <v-btn :disabled="isLoading" v-if="props.data?.user?.id !== authStore?.user?.userData?.id" @click="toggleFollowUser(props.data?.user_id)" :variant="isFollowing ? 'outlined' : 'flat'"
             :color="isFollowing ? 'grey' : 'primary'">
        {{ isFollowing ? 'Following' : 'Follow' }}
        <UserPlusIcon v-if="isFollowing === 'Follow'" />
        <UserCheckIcon v-if="isFollowing === 'Following'" />
      </v-btn>
    </div>


    <!-- Media -->
    <div v-if="props.index % 2 === 0" class="media-wrapper" style="position: relative;">
      <!-- ✅ IMAGE -->
      <v-img v-if="props.data?.media[0]?.type === 'image'" :src="backEndURL + `/${props.data?.media[0]?.media_url}`" class="rounded-none mb-4" height="350" cover
             @dblclick="onMediaDoubleClick(props.data?.id)" />

      <!-- ✅ VIDEO -->
      <video v-else-if="props.data?.media[0]?.type === 'video'" :src="backEndURL + `/${props.data?.media[0]?.media_url}`" controls class="rounded-none mb-4"
             style="width: 100%; max-height: 450px; background:#000; object-fit: contain;" @dblclick="onMediaDoubleClick(props.data?.id)"></video>

      <p class="text-body-1 mb-4">
        {{ props.data?.caption }}
      </p>

      <!-- Love effect -->
      <div v-if="showLove" class="love-animation">
        ❤️
      </div>
    </div>

    <!-- Text Post -->
    <p v-else class="text-body-1 mb-4">
      {{ props.data?.caption }}
    </p>

    <!-- Actions -->
    <div class="d-flex align-center gap-3 mt-2">
      <!-- LIKE button -->
      <v-btn :disabled="isLoading" variant="tonal" :color="userLiked ? 'red' : 'grey'" @click="toggleLikePost(props.data?.id)" class="text-capitalize d-flex align-center">
        <HeartIcon :size="22" class="mr-1" :stroke="userLiked ? 'red' : 'currentColor'" :fill="userLiked ? 'red' : 'none'" />
        {{ userLiked ? 'Liked' : 'Like' }}
      </v-btn>

      <!-- COMMENT button -->
      <v-btn :disabled="isLoading" variant="tonal" color="blue" class="text-capitalize d-flex align-center" @click="$emit('toggle-comment')">
        <MessageCircleIcon size="22" class="mr-1" />
        Comment
      </v-btn>

      <v-btn v-if="props.data?.user_id == authStore?.user?.userData?.id" color="secondary" variant="text" class="ml-3 mt-1 text-end" icon size="small" :loading="isLoading" :disabled="isLoading"
             @click="deletePost(props.data?.id)">
        <TrashIcon />
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
  .gap-3 {
    gap: 12px;
  }

  .love-animation {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
    font-size: 64px;
    color: red;
    opacity: 1;
    animation: pop 0.8s forwards;
    pointer-events: none;
    /* agar klik tidak terganggu */
  }

  @keyframes pop {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }

    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 1;
    }

    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }

</style>
