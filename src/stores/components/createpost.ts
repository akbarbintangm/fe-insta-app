import { defineStore } from 'pinia';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import { pageLoadingState } from '@/utils/helpers/page-loading';
import NProgress from 'nprogress';

const baseUrl = `${import.meta.env.VITE_API_URL}/api`;

export type PostType = 'text' | 'media';

export const createPostStore = defineStore('createpost', {
  state: () => ({
    createPostDialogActive: false
  }),
  actions: {
    async post(postType: PostType, caption: string, mediaFiles: File[], mediaType: string) {
      pageLoadingState.isLoading = true;
      NProgress.start();
      try {
        const response = await fetchWrapper.post(`${baseUrl}/posts`, { caption });

        if (response.status !== 'success') {
          throw new Error(response.data?.error || response.message || 'Post gagal');
        }

        const postId = response.data?.id;
        if (postId != null && postType === 'media' && mediaFiles.length > 0 && mediaType) {
          await this.postMedia(postType, postId, mediaFiles, mediaType);
        }
        if (!postId) throw new Error('Post ID tidak ditemukan dalam response');

        return response.data?.message || 'Post berhasil';
      } catch (error: any) {
        throw error.message || error;
      } finally {
        pageLoadingState.isLoading = false;
        NProgress.done();
      }
    },

    async postMedia(postType: PostType, postId: string, mediaFiles: File[], mediaType: string) {
      if (!mediaFiles.length || !mediaType) {
        throw new Error('File media atau mediaType tidak ditemukan');
      }

      pageLoadingState.isLoading = true;
      NProgress.start();
      try {
        const formData = new FormData();
        formData.append('postType', postType);
        formData.append('type', mediaType);
        formData.append('file', mediaFiles[0]!, mediaFiles[0]!.name);

        const response = await fetchWrapper.post(`${baseUrl}/post-media/${postId}`, formData, true);

        if (response.status !== 'success') {
          throw new Error(response.data?.error || response.message || 'Post media gagal');
        }

        return response;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        pageLoadingState.isLoading = false;
        NProgress.done();
      }
    }
  }
});
