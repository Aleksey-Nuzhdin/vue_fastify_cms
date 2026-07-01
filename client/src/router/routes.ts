import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  // Публичные
  {
    path: '',
    name: 'home',
    component: () => import('@/modules/public/pages/Home/HomePage.vue'),
    meta: { guest: true, layout: 'default', title: 'router.home' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/LoginPage.vue'),
    meta: { guest: true, layout: 'auth', title: 'auth.login.title', theme:"accent" },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/modules/auth/pages/Registration.vue'),
    meta: { guest: true, layout: 'auth', title: 'router.register', theme:"primary"  },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/modules/auth/pages/ForgotPassword.vue'),
    meta: { guest: true, layout: 'auth', title: 'auth.forgot.title',  theme:"accent"  },
  },

  // Требуют авторизации
  {
    path: '',
    meta: { layout: 'profile' },
    // component: () => import('@/modules/profile/components/ProfileLayout.vue'),
    children: [
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@/modules/profile/pages/ProfilePage.vue'),
        meta: { auth: true, title: 'nav.profile' },
        children:[]
      },
      {
        path: '',
        children: [{
            path:'',
            name: 'profile-reports-layout',
            component: () => import('@/modules/profile/components/ProfileReportsLayout.vue'),
            children:[{
              path: '/profile/reports',
              name: 'profile-report-list',
              component: () => import('@/modules/profile/pages/ProfileReportsPage.vue'),
              meta: { auth: true,  title: 'Мои доклады' },
            },{
              path: '/profile/reports/create',
              name: 'profile-report-create',
              component: () => import('@/modules/profile/pages/ProfileReportCreatePage.vue'),
              meta: { auth: true,  title: 'Создание доклада' },
            }]
          },{
            path: '/profile/reports/view/:idReport',
            name: 'profile-report-view',
            component: () => import('@/modules/profile/pages/ProfileReportViewPage.vue'),
            meta: { auth: true, title: 'Просмотр доклада' },
          },{
            path: '/profile/reports/edit/:idReport',
            name: 'profile-report-edit',
            component: () => import('@/modules/profile/pages/ProfileReportEditPage.vue'),
            meta: { auth: true, title: 'Просмотр доклада' },
          }
        ]
      }
    ],
  },
  {
    path: '',
    name: 'admin-layout',
    component: () => import('@/modules/admin/components/AdminPageLayout.vue'),
    meta: { auth: true, layout: 'admin', roles: ['admin', 'manager', 'vereficator'] },
    children:[{
      path: '/admin',
      name: 'admin',
      redirect: { name: 'admin-pages-data' },
    },{
      path: '/admin/pages-data',
      name: 'admin-pages-data',
      component: () => import('@/modules/admin/pages-data/pages/AdminPagesDataPage.vue'),
      meta: { title: 'nav.pagesData', roles: ['admin', 'manager'], roleRedirect: { name: 'admin-reports' } },
    },{
      path: '/admin/files',
      name: 'admin-files',
      component: () => import('@/modules/admin/files/pages/AdminFilesPage.vue'),
      meta: { title: 'nav.files', roles: ['admin', 'manager'], roleRedirect: { name: 'admin-reports' }  },

    },{
      path: '/admin/reports',
      name: 'admin-reports',
      component: () => import('@/modules/admin/reports/pages/AdminReportsPage.vue'),
      meta: { title: 'Доклады' },
    },{
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/modules/admin/users/pages/AdminUsersPage.vue'),
      meta: { title: 'nav.users' },
    }]
  },
  {
    path: '/test',
    name: 'testPage',
    component: () => import('@/modules/testPage/page/TestPage.vue'),
    meta: { auth: true, layout: 'default', roles: ['admin'], title: 'Тест' },
  },
  {
    path: '/guard',
    name: 'guardSuper',
    component: () => import('@/pages/GuardPage.vue'),
    meta: { auth: true, layout: 'default', roles: [], title: 'Guard' },
  },

  // // Только для админа/менеджера
  // {
  //   path: '/users',
  //   name: 'users',
  //   component: () => import('@/modules/users/pages/UsersPage.vue'),
  //   meta: { auth: true, roles: ['admin', 'manager'] },
  // },
  // {
  //   path: '/users/:id',
  //   name: 'user-detail',
  //   component: () => import('@/modules/users/pages/UserDetailPage.vue'),
  //   meta: { auth: true, roles: ['admin', 'manager'] },
  // },

  // // Только для админа
  // {
  //   path: '/settings',
  //   name: 'settings',
  //   component: () => import('@/pages/SettingsPage.vue'),
  //   meta: { auth: true, roles: ['admin'] },
  // },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/404Page.vue'),
    meta: { title: 'notFound.title', layout: 'empty' },
  },
]
