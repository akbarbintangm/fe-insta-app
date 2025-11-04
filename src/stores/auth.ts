import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

const baseUrl = `${import.meta.env.VITE_API_URL}/api/auth`;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // initialize state from local storage
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    returnUrl: '/'
  }),

  actions: {
    async login(email: string, password: string, remember: boolean = false) {
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
      }
    },

    async register(firstName: string, lastName: string, email: string, password: string) {
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
      }
    },

    logout() {
      this.user = null;
      localStorage.removeItem('user');
      router.push('/login');
    }
  }
});
