import { defineStore } from 'pinia';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import NProgress from 'nprogress';

const baseUrl = `${import.meta.env.VITE_API_URL}/api/users`;

export const useUsernameStore = defineStore('username', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    returnUrl: '/'
  }),

  actions: {
    async save(username: string) {
      NProgress.start();

      try {
        const response = await fetchWrapper.put(`${baseUrl}/username/change`, {
          username: username
        });

        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        return response.message ?? 'Username berhasil disimpan.';
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
      }
    },

    async fetchUsername(username: string) {
      NProgress.start();

      try {
        const response = await fetchWrapper.put(`${baseUrl}/username/check`, {
          username: username
        });

        if (response.status !== 'success') {
          throw new Error(response.message || 'gagal');
        }
        return response.message ?? 'Username tersedia.';
      } catch (error: any) {
        throw error.message || error;
      } finally {
        NProgress.done();
      }
    }
  }
});
