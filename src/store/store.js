// src/store/store.js
import { reactive, ref, computed } from 'vue';
import AV from "leancloud-storage";
import { MOODS, ANIMALS, INITIAL_INVENTORY, ANIMAL_DIALOGUES } from '../data/constants';

// ------------------------------------
// 工具函数
// ------------------------------------
const getCurrentDate = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// ------------------------------------
// 状态
// ------------------------------------
const state = reactive({
  currentAnimalId: 'RABBIT',
  todayMood: 'UNKNOWN',
  historyRecords: [],
  accessoryInventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY)),
  continuousDays: 0,
  feedbackMessage: '',
  user: null,  // 当前用户
});

const currentView = ref('home');

// ------------------------------------
// Computed
// ------------------------------------
const currentAnimal = computed(() => ANIMALS[state.currentAnimalId] || ANIMALS.RABBIT);
const todayMoodData = computed(() => MOODS[state.todayMood] || MOODS.UNKNOWN);

const equippedAccessory = computed(() => {
  for (const id in state.accessoryInventory) {
    if (state.accessoryInventory[id].equipped) return state.accessoryInventory[id];
  }
  return null;
});

// ------------------------------------
// LocalStorage（按用户隔离）
// ------------------------------------
const saveData = () => {
  const userId = state.user?.id;
  if (!userId) return;  // 没有登录则不保存
  const data = {
    currentAnimalId: state.currentAnimalId,
    todayMood: state.todayMood,
    historyRecords: state.historyRecords,
    accessoryInventory: state.accessoryInventory,
    continuousDays: state.continuousDays,
  };
  localStorage.setItem(`companionApp_state_${userId}`, JSON.stringify(data));
};

const loadLocalData = () => {
  const userId = state.user?.id;
  if (!userId) return;  // 没有登录则不加载
  const stored = localStorage.getItem(`companionApp_state_${userId}`);
  if (!stored) return;
  try {
    Object.assign(state, JSON.parse(stored));
    console.log('LocalStorage 数据加载成功');
  } catch (e) {
    console.error('LocalStorage 解析失败', e);
  }
};

// ------------------------------------
// 新注册用户初始化
// ------------------------------------
function resetForNewUser() {
  state.historyRecords = [];
  state.todayMood = "UNKNOWN";
  state.continuousDays = 0;
  state.currentAnimalId = 'RABBIT';
  const newInventory = JSON.parse(JSON.stringify(INITIAL_INVENTORY));
  for (const id in newInventory) {
    newInventory[id].unlocked = false;
    newInventory[id].equipped = false;
  }
  state.accessoryInventory = newInventory;
  saveData();
}

// ------------------------------------
// 云端 UserProfile
// ------------------------------------
const loadUserProfile = async () => {
  const user = AV.User.current();
  if (!user) return;

  const query = new AV.Query("UserProfile");
  query.equalTo("userId", user.id);
  const profile = await query.first();

  if (profile) {
    state.currentAnimalId = profile.get("currentAnimalId") || 'RABBIT';
    const inv = profile.get("accessoryInventory") || {};
    for (const id in state.accessoryInventory) {
      if (inv[id]) {
        state.accessoryInventory[id].unlocked = inv[id].unlocked ?? false;
        state.accessoryInventory[id].equipped = inv[id].equipped ?? false;
      }
    }
  } else {
    await saveUserProfile(); // 没有 profile，新建
  }
};

const saveUserProfile = async () => {
  const user = AV.User.current();
  if (!user) return;

  const query = new AV.Query("UserProfile");
  query.equalTo("userId", user.id);
  let profile = await query.first();

  if (!profile) {
    const Profile = AV.Object.extend("UserProfile");
    profile = new Profile();
    profile.set("userId", user.id);
  }

  profile.set("currentAnimalId", state.currentAnimalId);
  profile.set("accessoryInventory", state.accessoryInventory);
  await profile.save();
};

// ------------------------------------------------------
// 登录 / 注册
// ------------------------------------------------------
const registerByEmail = async (email, password) => {
  const user = new AV.User();
  user.setUsername(email);
  user.setEmail(email);
  user.setPassword(password);

  const result = await user.signUp();
  state.user = result;

  resetForNewUser();
  await saveUserProfile();
  return result;
};

const loginByEmail = async (email, password) => {
  const user = await AV.User.logIn(email, password);
  state.user = user;

  await loadCloudData();
  await loadUserProfile();

  // 设置今天心情
  const today = getCurrentDate();
  const todayRecord = state.historyRecords.find(r => r.date === today);
  state.todayMood = todayRecord ? todayRecord.mood : 'UNKNOWN';

  saveData();
  return user;
};

const logout = async () => {
  await AV.User.logOut();
  state.user = null;
  state.historyRecords = [];
  state.todayMood = 'UNKNOWN';
  state.continuousDays = 0;
  state.currentAnimalId = 'RABBIT';
};

// ------------------------------------------------------
// 云端加载历史心情
// ------------------------------------------------------
const loadCloudData = async () => {
  const user = AV.User.current();
  if (!user) return;

  const query = new AV.Query("UserMoodRecord");
  query.equalTo("userId", user.id);
  query.ascending("date");
  const results = await query.find();

  state.historyRecords = results.map(r => ({
    date: r.get("date"),
    mood: r.get("mood")
  }));

  updateContinuousDays();
  checkReward();

  const today = getCurrentDate();
  const todayRecord = state.historyRecords.find(r => r.date === today);
  state.todayMood = todayRecord ? todayRecord.mood : 'UNKNOWN';

  saveData();
  console.log("云端数据加载完成");
};

// ------------------------------------------------------
// 逻辑函数
// ------------------------------------------------------
const updateContinuousDays = () => {
  state.continuousDays = state.historyRecords.length;
};

const showFeedback = (msg) => {
  state.feedbackMessage = msg;
  setTimeout(() => state.feedbackMessage = '', 2500);
};

const checkReward = () => {
  const days = state.continuousDays;
  for (const id in state.accessoryInventory) {
    const acc = state.accessoryInventory[id];
    if (!acc.unlocked && acc.requiredDays <= days) {
      acc.unlocked = true;
      showFeedback(`🎉 解锁新饰品：${acc.name}`);
    }
  }
  saveData();
};

// ------------------------------------------------------
// 云端记录心情
// ------------------------------------------------------
const recordMood = async (mood) => {
  const today = getCurrentDate();
  const user = AV.User.current();
  if (!user) {
    showFeedback("请先登录");
    return;
  }

  const query = new AV.Query("UserMoodRecord");
  query.equalTo("userId", user.id);
  query.equalTo("date", today);

  let todayRecord = await query.first();
  if (todayRecord) {
    todayRecord.set("mood", mood);
    await todayRecord.save();
  } else {
    const MoodRecord = AV.Object.extend("UserMoodRecord");
    const record = new MoodRecord();
    record.set("userId", user.id);
    record.set("date", today);
    record.set("mood", mood);
    await record.save();
  }

  const last = state.historyRecords[state.historyRecords.length - 1];
  if (last && last.date === today) {
    last.mood = mood;
  } else {
    state.historyRecords.push({ date: today, mood });
    updateContinuousDays();
    checkReward();
  }

  state.todayMood = mood;
  saveData();
  showFeedback(`心情记录成功: ${MOODS[mood].cn}!`);
};

// ------------------------------------------------------
// 饰品 & 动物切换
// ------------------------------------------------------
const equipAccessory = async (id) => {
  const acc = state.accessoryInventory[id];
  if (!acc || !acc.unlocked) {
    showFeedback(`饰品未解锁`);
    return;
  }

  if (acc.equipped) {
    acc.equipped = false;
    showFeedback(`已卸下 ${acc.name}`);
  } else {
    for (const k in state.accessoryInventory) state.accessoryInventory[k].equipped = false;
    acc.equipped = true;
    showFeedback(`已佩戴 ${acc.name}`);
  }

  saveData();
  await saveUserProfile();
};

const selectAnimal = async (animalId) => {
  if (state.currentAnimalId === animalId) {
    showFeedback(`已是 ${ANIMALS[animalId].name}`);
    return;
  }

  state.currentAnimalId = animalId;
  for (const k in state.accessoryInventory) state.accessoryInventory[k].equipped = false;

  saveData();
  await saveUserProfile();
  showFeedback(`切换为 ${ANIMALS[animalId].name}`);
};

// ------------------------------------------------------
// 小动物对话
// ------------------------------------------------------
const getAnimalDialogue = () => {
  const dlg = ANIMAL_DIALOGUES[state.currentAnimalId];
  const mood = state.todayMood in MOODS ? state.todayMood : "UNKNOWN";
  return dlg ? (dlg[mood] || dlg.UNKNOWN) : "点击小动物互动哦！";
};

// ------------------------------------------------------
// 导出
// ------------------------------------------------------
export function useStore() {
  return {
    state,
    currentView,
    currentAnimal,
    todayMoodData,
    equippedAccessory,

    loadLocalData,
    saveData,

    registerByEmail,
    loginByEmail,
    logout,
    loadCloudData,

    recordMood,
    equipAccessory,
    selectAnimal,
    getAnimalDialogue,
    showFeedback,

    MOODS,
    ANIMALS,
  };
}
