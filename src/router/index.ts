/**
 * Vue Router
 * Sumber: SSoT/04_participant_flow.md, SSoT/05_administration_flow.md
 */

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { title: 'Beranda' },
  },
  {
    path: '/participant/biodata',
    name: 'participant-biodata',
    component: () => import('@/views/participant/BiodataView.vue'),
    meta: { title: 'Biodata' },
  },
  {
    path: '/participant/test/:publicToken',
    name: 'participant-test',
    component: () => import('@/views/participant/TestView.vue'),
    meta: { title: 'Tes Online' },
  },
  {
    path: '/participant/finish/:publicToken',
    name: 'participant-finish',
    component: () => import('@/views/participant/FinishView.vue'),
    meta: { title: 'Selesai' },
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/LoginView.vue'),
    meta: { title: 'Login Administrator' },
  },
  {
    path: '/admin/dashboard',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: { title: 'Dashboard', requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'admin-participants' },
      },
      {
        path: 'participants',
        name: 'admin-participants',
        component: () => import('@/views/admin/ParticipantsView.vue'),
      },
      {
        path: 'participants/:id',
        name: 'admin-participant-detail',
        component: () => import('@/views/admin/ParticipantDetailView.vue'),
      },
      {
        path: 'bank-soal',
        name: 'admin-bank-soal',
        component: () => import('@/views/admin/BankSoalView.vue'),
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('@/views/admin/SettingsView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Halaman Tidak Ditemukan' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const { adminApi } = await import('@/lib/api.js');
    try {
      const res = await adminApi.checkSession();
      if (!res.data?.authenticated) {
        return { name: 'admin-login' };
      }
    } catch {
      return { name: 'admin-login' };
    }
  }

  if (to.meta.title) {
    document.title = `${to.meta.title} - Online Test`;
  }

  return true;
});

export default router;
