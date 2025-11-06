import { defineStore } from 'pinia';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import NProgress from 'nprogress';
import { pageLoadingState } from '@/utils/helpers/page-loading';

const baseUrlPost = `${import.meta.env.VITE_API_URL}/api/posts`;
const baseUrlLike = `${import.meta.env.VITE_API_URL}/api/likes`;
const baseUrlFollow = `${import.meta.env.VITE_API_URL}/api/follow`;
const baseUrlComment = `${import.meta.env.VITE_API_URL}/api/comments`;

export const usePostStore = defineStore('post', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    returnUrl: '/'
  }),

  actions: {
    async fetchAll() {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      /* TODO ULTIMATE PAGINATION SCROLL */
      try {
        const response = await fetchWrapper.get(`${baseUrlPost}`);
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        return response.data;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async fetchById(id: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.get(`${baseUrlPost}/${id}`);
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        return response.data;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async update(id: string, caption: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.put(`${baseUrlPost}/${id}`, {
          caption: caption
        });
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        return response.message;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async delete(id: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.delete(`${baseUrlPost}/${id}`);
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        return response.message;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async like(id: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.post(`${baseUrlLike}/${id}`);
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        // return response.message;
        return;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async unlike(id: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.delete(`${baseUrlLike}/${id}`);
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        // return response.message;
        return;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async follow(id: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.post(`${baseUrlFollow}/${id}`);
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        // return response.message;
        return;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async unfollow(id: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.delete(`${baseUrlFollow}/${id}`);
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        // return response.message;
        return;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async giveComment(id: string, comment: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.post(`${baseUrlComment}/${id}`, {
          comment: comment
        });
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        // return response.message;
        return;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    },
    async deleteComment(id: string, idComments: string) {
      NProgress.start();
      // pageLoadingState.isLoading = true;
      try {
        const response = await fetchWrapper.delete(`${baseUrlComment}/${id}/${idComments}`, {});
        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        return response.message;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
        // pageLoadingState.isLoading = false;
      }
    }
  }
});
