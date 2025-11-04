import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';
import { pageLoadingState } from '@/utils/helpers/page-loading';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    },
    MainRoutes,
    PublicRoutes
  ]
});

interface User {
  // Define the properties and their types for the user data here
  // For example:
  id: number;
  name: string;
}

// Assuming you have a type/interface for your authentication store
interface AuthStore {
  user: User | null;
  returnUrl: string | null;
  login(email: string, password: string): Promise<void>;
  register(firstName: string, lastName: string, email: string, password: string): Promise<void>;
  logout(): void;
}

router.beforeEach(async (to, from, next) => {
  pageLoadingState.isLoading = true;
  NProgress.start();
  next();
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/'];
  const auth: AuthStore = useAuthStore();

  const isPublicPage = publicPages.includes(to.path);
  const authRequired = !isPublicPage && to.matched.some((record) => record.meta.requiresAuth);

  // User not logged in and trying to access a restricted page
  if (authRequired && !auth.user) {
    auth.returnUrl = to.fullPath; // Save the intended page
    next('/login');
  } else if (auth.user && to.path === '/login') {
    // User logged in and trying to access the login page
    next({
      query: {
        ...to.query,
        redirect: auth.returnUrl !== '/' ? to.fullPath : undefined
      }
    });
  } else {
    // All other scenarios, either public page or authorized access
    next();
  }
});

router.afterEach(() => {
  setTimeout(() => {
    pageLoadingState.isLoading = false;
    NProgress.done();
  }, 300);
});

export default router;
