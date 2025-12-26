<script setup>
import { reactive, ref, onMounted, h, defineComponent } from 'vue';
import AV from 'leancloud-storage';
import { useStore } from './store/store';
const store = useStore();

// ----------------------------------------
// 页面组件
// ----------------------------------------
import HomeView from './components/HomeView.vue';
import LogView from './components/LogView.vue';
import InventoryView from './components/InventoryView.vue';

// ----------------------------------------
// LeanCloud 配置
// ----------------------------------------
const LEANCLOUD_APP_ID = '99gBMI86KVfPatJCzEXH4eXm-MdYXbMMI';
const LEANCLOUD_APP_KEY = 'Iw3SpkjLtxmEhT5uoP4De7Cr';
const LEANCLOUD_SERVER_URL = 'https://99gbmi86.api.lncldglobal.com';

// ----------------------------------------
// 登录状态
// ----------------------------------------
const isAuthenticated = ref(false);
const isAuthReady = ref(false);
const userId = ref(null);
const authMode = ref("login");

const authForm = reactive({
  email: "",
  password: "",
  error: null,
});

// ----------------------------------------
// 页面切换
// ----------------------------------------
const currentView = ref("home");
const changeView = (view) => { currentView.value = view };

// ----------------------------------------
// 底部导航栏
// ----------------------------------------
const navItems = [
  { view: "home", label: "首页", icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-10v10a1 1 0 001 1h3m-6 0a1 1 0 001-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 001 1zm-6 0h.01" /></svg>` },
  { view: "log", label: "日志", icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>` },
  { view: "inventory", label: "饰品", icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13v4m0-4V3m-4 5h8m-8 4h8m-8 4h8" /></svg>` },
];

// ----------------------------------------
// LeanCloud 用户配置同步
// ----------------------------------------
// const syncUserProfile = async () => {
//   const user = AV.User.current();
//   if (!user) return;

//   const query = new AV.Query('UserProfile');
//   query.equalTo('userId', user.id);
//   let profile = await query.first();

//   if (!profile) {
//     // 新用户创建 profile
//     const UserProfile = AV.Object.extend('UserProfile');
//     profile = new UserProfile();
//     profile.set('userId', user.id);
//     profile.set('currentAnimalId', store.state.currentAnimalId);
//     profile.set('accessoryInventory', store.state.accessoryInventory);
//     await profile.save();
//   } else {
//     // 老用户读取云端小动物和饰品状态
//     store.state.currentAnimalId = profile.get('currentAnimalId');
//     store.state.accessoryInventory = profile.get('accessoryInventory');
//     store.saveData();
//   }
//   return profile;
// };

// // 更新云端用户状态
// const updateUserProfile = async () => {
//   const user = AV.User.current();
//   if (!user) return;

//   const query = new AV.Query('UserProfile');
//   query.equalTo('userId', user.id);
//   const profile = await query.first();
//   if (profile) {
//     profile.set('currentAnimalId', store.state.currentAnimalId);
//     profile.set('accessoryInventory', store.state.accessoryInventory);
//     await profile.save();
//   }
// };

// ----------------------------------------
// 登录状态检查
// ----------------------------------------
const checkAuthState = async (user = null) => {
  const u = user || AV.User.current();
  if (u) {
    isAuthenticated.value = true;
    userId.value = u.id;
    store.state.user = u;

    // 从本地加载缓存
    store.loadLocalData();

    // 云端加载历史心情
    await store.loadCloudData();

    // 云端同步小动物和饰品状态
      await store.loadUserProfile(); // ✅ 动物 + 饰品
  } else {
    isAuthenticated.value = false;
    userId.value = null;
  }
  isAuthReady.value = true;
};

// ----------------------------------------
// 登录 / 注册
// ----------------------------------------
const handleAuth = async () => {
  authForm.error = null;
  try {
    let user;
    if (authMode.value === "register") {
      user = await store.registerByEmail(authForm.email, authForm.password);
    } else {
      user = await store.loginByEmail(authForm.email, authForm.password);
    }
    await checkAuthState(user);
    currentView.value = "home";
  } catch (e) {
    authForm.error = e.rawMessage || e.message || "未知错误";
  }
};

// ----------------------------------------
// 登出
// ----------------------------------------
const signOutUser = async () => {
  await store.logout();
  await checkAuthState(null);
  localStorage.removeItem(`companionApp_state_guest`);
  console.log("已登出并清空缓存！");
};

// ----------------------------------------
// 佩戴/卸下饰品时同步云端
// ----------------------------------------
// store.equipAccessory = async (id) => {
//   const acc = store.state.accessoryInventory[id];
//   if (!acc || !acc.unlocked) {
//     store.showFeedback(`饰品未解锁`);
//     return;
//   }

//   // 如果已佩戴则卸下
//   if (acc.equipped) {
//     acc.equipped = false;
//     store.showFeedback(`已卸下 ${acc.name}`);
//   } else {
//     // 其他饰品全部卸下
//     for (const k in store.state.accessoryInventory) {
//       store.state.accessoryInventory[k].equipped = false;
//     }
//     acc.equipped = true;
//     store.showFeedback(`已佩戴 ${acc.name}`);
//   }

//   store.saveData();
//   await updateUserProfile();
// };

// // 切换小动物也同步云端
// store.selectAnimal = async (animalId) => {
//   if (store.state.currentAnimalId === animalId) {
//     store.showFeedback(`已是 ${store.MOODS[animalId]?.name}`);
//     return;
//   }
//   store.state.currentAnimalId = animalId;

//   // 卸下所有饰品
//   for (const k in store.state.accessoryInventory) {
//     store.state.accessoryInventory[k].equipped = false;
//   }

//   store.saveData();
//   await updateUserProfile();
//   store.showFeedback(`切换为 ${store.ANIMALS[animalId].name}`);
// };

// ----------------------------------------
// LeanCloud 初始化
// ----------------------------------------
onMounted(() => {
  AV.init({
    appId: LEANCLOUD_APP_ID,
    appKey: LEANCLOUD_APP_KEY,
    serverURL: LEANCLOUD_SERVER_URL,
  });

  checkAuthState();
});

// ----------------------------------------
// AuthView 登录组件
// ----------------------------------------
const AuthView = defineComponent({
  name: "AuthView",
  setup() {
    return () =>
      h("div", { class: "min-h-screen bg-gray-100 flex items-center justify-center p-4" }, [
        h("div", { class: "w-full max-w-sm bg-white rounded-xl shadow-2xl p-8" }, [
          h("h1", { class: "text-3xl font-bold text-center text-indigo-600 mb-6" },
            authMode.value === "login" ? "用户登录" : "注册账号"
          ),
          h("form",
            {
              onSubmit: (e) => { e.preventDefault(); handleAuth(); },
              class: "space-y-4",
            },
            [
              h("input", {
                value: authForm.email,
                onInput: (e) => authForm.email = e.target.value,
                type: "email",
                placeholder: "邮箱",
                required: true,
                class: "w-full px-4 py-2 border rounded-lg",
              }),
              h("input", {
                value: authForm.password,
                onInput: (e) => authForm.password = e.target.value,
                type: "password",
                placeholder: "密码（至少6位）",
                required: true,
                class: "w-full px-4 py-2 border rounded-lg",
              }),
              authForm.error ? h("div", { class: "text-red-500 text-sm p-2 bg-red-50 rounded-lg" }, authForm.error) : null,
              h("button", { type: "submit", class: "w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700" },
                authMode.value === "login" ? "登录" : "注册"
              ),
            ]
          ),
          h("div", { class: "mt-6 text-center" }, [
            h("button", {
              onClick: () => { authMode.value = authMode.value === "login" ? "register" : "login"; authForm.error = null; },
              class: "text-indigo-500 hover:text-indigo-700 text-sm",
            }, authMode.value === "login" ? "还没有账号？去注册" : "已有账号？去登录"),
          ]),
        ]),
      ]);
  },
});
</script>

<template>
  <!-- 加载中 -->
  <div v-if="!isAuthReady" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-xl text-gray-500">加载中...</div>
  </div>

  <!-- 未登录 -->
  <AuthView v-else-if="!isAuthenticated" />

  <!-- 已登录 -->
  <div v-else class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col min-h-[80vh]">
      <!-- 顶栏 -->
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-xl font-bold text-indigo-600">情绪陪伴</h2>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">UID: {{ userId }}</span>
          <button @click="signOutUser" class="px-3 py-1 bg-red-500 text-white text-sm rounded-lg">登出</button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-grow overflow-y-auto">
        <component :is="currentView === 'home' ? HomeView : (currentView === 'log' ? LogView : InventoryView)" />
      </div>

      <!-- 底部导航栏 -->
      <div class="bg-white border-t flex justify-around p-2 text-gray-500">
        <button
          v-for="item in navItems"
          :key="item.view"
          @click="changeView(item.view)"
          class="flex flex-col items-center w-1/4"
          :class="{
            'text-indigo-600 scale-105': currentView === item.view,
            'hover:text-indigo-600': currentView !== item.view
          }"
        >
          <span v-html="item.icon" class="h-6 w-6 mb-1"></span>
          <span class="text-xs">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.flex-grow::-webkit-scrollbar {
  width: 4px;
}
.flex-grow::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.5);
  border-radius: 2px;
}
</style>














