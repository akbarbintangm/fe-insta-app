<script setup lang="ts">
    import { ref, shallowRef, onMounted, onBeforeUnmount, nextTick } from 'vue'
    import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue'
    import PostCard from '@/components/apps/posts/PostCard.vue'
    import CommentCard from '@/components/apps/posts/CommentCard.vue'

    import { useModalStore } from '@/stores/components/modal';
    const modal = useModalStore();

    import { useConfirmStore } from '@/stores/components/confirmation';
    const confirm = useConfirmStore();

    import { useAuthStore } from '@/stores/auth';
    const authStore = useAuthStore();

    import { usePostStore } from '@/stores/apps/post';
    const postStore = usePostStore();

    const isLoading = ref(false);

    const openComment = ref<boolean[]>([]);
    const activeIndex = ref(0)
    const postRefs = ref<(HTMLElement | null)[]>([])

    const page = ref({ title: 'Home Page' })
    const breadcrumbs = shallowRef([
        { title: 'Others', disabled: false, href: '#' },
        { title: 'Home Page', disabled: true, href: '#' },
    ])

    const data = ref<any[]>([]);

    // Scroll ke post tertentu
    // function scrollToPost(index: number) {
    //   if (index < 0) index = 0
    //   if (index >= 10) index = 9
    //   activeIndex.value = index
    //   nextTick(() => {
    //     postRefs.value[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    //   })
    // }

    // Keyboard handler (tidak mencegah default, tapi tetap arrow key control)
    // function handleKeydown(e: KeyboardEvent) {
    //   const tag = (document.activeElement?.tagName || '').toLowerCase()
    //   if (tag === 'input' || tag === 'textarea') return // skip jika focus di input
    //   if (e.key === 'ArrowDown') scrollToPost(activeIndex.value + 1)
    //   if (e.key === 'ArrowUp') scrollToPost(activeIndex.value - 1)
    // }

    // Wheel handler dengan throttle
    // let isScrolling = false
    // function handleWheel(e: WheelEvent) {
    //   if (isScrolling) return
    //   isScrolling = true

    //   if (e.deltaY > 0) scrollToPost(activeIndex.value + 1)
    //   if (e.deltaY < 0) scrollToPost(activeIndex.value - 1)

    //   setTimeout(() => {
    //     isScrolling = false
    //   }, 400) // throttle
    // }

    onMounted(() => {
        // window.addEventListener('keydown', handleKeydown)
        // window.addEventListener('wheel', handleWheel, { passive: true })

        fetchAll();
    })

    onBeforeUnmount(() => {
        // window.removeEventListener('keydown', handleKeydown)
        // window.removeEventListener('wheel', handleWheel)
    })

    async function fetchAll() {
        /* TODO ULTIMATE PAGINATION SCROLL */
        isLoading.value = true;
        try {
            await postStore.fetchAll()
                .then((response) => {
                    data.value = response;
                    openComment.value = new Array(response.length).fill(true);
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

    // async function reloadPost(id: string) {
    //     isLoading.value = true;
    //     try {
    //         await postStore.fetchById(id)
    //             .then((response) => {
    //                 const index = data.value.findIndex((p) => p.id === id);
    //                 if (index !== -1) {
    //                     data.value[index] = response;
    //                 }
    //             })
    //             .catch((error) => {
    //                 modal.messageDialogActive = true
    //                 modal.messageDialogText = error
    //             })
    //             .finally(() => {
    //             })
    //     } catch (error: any) {
    //         modal.messageDialogActive = true
    //         modal.messageDialogText = error
    //     } finally {
    //         isLoading.value = false;
    //     }
    // }

    async function reloadPost(id: string) {
        isLoading.value = true;

        try {
            const response = await postStore.fetchById(id);

            const index = data.value.findIndex((p) => p.id === id);

            if (index !== -1) {
                // update post
                data.value[index] = response;

                // biar panel comment tetap terbuka
                openComment.value[index] = true;

                // optional: scroll balik
                nextTick(() => {
                    postRefs.value[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
            }

        } catch (error: any) {
            modal.messageDialogActive = true
            modal.messageDialogText = error
        } finally {
            isLoading.value = false;
        }
    }


</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

    <div class="feed-container px-2" v-if="authStore.user?.userData">

        <div v-for="(post, i) in data" :key="i" class="post-screen" ref="el => postRefs[i] = el">
            <v-row no-gutters class="h-100">

                <!-- POST -->
                <v-col :cols="openComment[i] ? 8 : 12" class="d-flex justify-center">
                    <div class="post-max-width">
                        <PostCard :data="post" :index="i" @post-deleted="fetchAll" @toggle-comment="openComment[i] = !openComment[i]" />
                    </div>
                </v-col>

                <!-- COMMENT -->
                <v-col v-if="openComment[i]" cols="4" class="comment-wrapper pl-4 pr-4">
                    <CommentCard :data="post" :index="i" @comment-added="reloadPost" />
                </v-col>
            </v-row>
        </div>

    </div>
</template>

<style scoped>
    .feed-container {
        width: 100%;
    }

    .post-screen {
        height: 85vh;
        width: 100%;
        margin-bottom: 40px;
    }

    .post-max-width {
        width: 100%;
        max-width: 720px;
    }

    .comment-wrapper {
        height: 100%;
    }
</style>
