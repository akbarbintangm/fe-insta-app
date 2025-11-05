import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

import { pageLoadingState } from '@/utils/helpers/page-loading';
import NProgress from 'nprogress';

const baseUrl = `${import.meta.env.VITE_API_URL}/api/auth`;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // initialize state from local storage
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    returnUrl: '/'
  }),

  actions: {
    async login(email: string, password: string, remember: boolean = false) {
      pageLoadingState.isLoading = true;
      NProgress.start();
      try {
        const response = await fetchWrapper.post(`${baseUrl}/login`, {
          email: email,
          password: password,
          remember: remember
        });
        if (response.status !== 'success') {
          throw new Error(response.message || 'Login gagal');
        }
        const token = response.data?.token;
        const userData = response.data?.user;
        if (!token) throw new Error('Token tidak ditemukan dalam response');
        this.user = { userData, token };
        localStorage.setItem('user', JSON.stringify(this.user));
        router.push(this.returnUrl || '/');
      } catch (error: any) {
        throw error.message || error;
      } finally {
        pageLoadingState.isLoading = false;
        NProgress.done();
      }
    },

    async register(firstName: string, lastName: string, email: string, password: string) {
      pageLoadingState.isLoading = true;
      NProgress.start();
      try {
        let fullName = firstName + ' ' + (lastName ? ' ' + lastName : '');
        const response = await fetchWrapper.post(`${baseUrl}/register`, {
          name: fullName,
          email: email,
          password: password
        });
        if (response.status !== 'success') {
          throw new Error(response.data.error || response.message || 'Register gagal');
        }
        await this.login(email, password, true);
      } catch (error: any) {
        throw error.message || error;
      } finally {
        pageLoadingState.isLoading = false;
        NProgress.done();
      }
    },

    async logout() {
      pageLoadingState.isLoading = true;
      NProgress.start();
      try {
        // seharusnya disini confirmation dulu pakai confirmation dialog tadi
        const response = await fetchWrapper.post(`${baseUrl}/logout`, {});
        if (response.status !== 'success') {
          throw new Error(response.data.error || response.message || 'Logout gagal');
        }
        this.user = null;
        localStorage.removeItem('user');
        router.push('/login');
      } catch (error: any) {
        throw error.message || error;
      } finally {
        pageLoadingState.isLoading = false;
        NProgress.done();
      }
    },

    async refresh() {
      pageLoadingState.isLoading = true;
      NProgress.start();
      try {
        const response = await fetchWrapper.post(`${baseUrl}/refresh`, {});
        if (response.status !== 'success') {
          throw new Error(response.message || 'Refresh gagal');
        }
        const token = response.data?.token;
        const userData = response.data?.user;
        if (!token) throw new Error('Token tidak ditemukan dalam response');
        this.user = { userData, token };
        localStorage.setItem('user', JSON.stringify(this.user));
        return;
      } catch (error: any) {
        throw error.message || error;
      } finally {
        pageLoadingState.isLoading = false;
        NProgress.done();
      }
    }
  }
});
