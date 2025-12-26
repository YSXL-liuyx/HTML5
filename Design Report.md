**《心情记录与小动物陪伴应用》设计报告**

**1\. 项目概述**

本系统是一个基于 **Vue3 + LeanCloud + LocalStorage+vant+ Capacitor**的「心情记录 + 虚拟宠物陪伴」应用。  
用户可以每天记录心情，系统会更新虚拟小动物的状态，并随连续打卡天数解锁饰品。

系统支持：

- 邮箱注册 / 登录（LeanCloud）
- 云端同步历史心情数据
- 云端同步虚拟宠物与饰品状态
- 本地缓存（按用户隔离）
- 丰富的 UI 交互：心情选择、角色切换、饰品佩戴、连续天数奖励

核心逻辑集中在 store.js 中，负责状态管理、云端交互、奖励系统和小动物行为。

**2\. 系统架构**

┌──────────────────────┐

│ Vue3 前端界面 │

└───────────┬──────────┘

│ 调用

┌───────────▼──────────┐

│ 状态管理 Store │

│ (reactive / ref + JS) │

└───────┬──────────────┘

│ 调用

┌───────▼──────────┐ ┌─────────────────────┐

│ LocalStorage 管理 │ │ LeanCloud 云数据库 │

│（按用户 ID 缓存） │ │ UserMoodRecord │

└──────────┬────────┘ │ UserProfile │

│ 同步 └─────────────────────┘

核心思想：  
**单一 Store 管理 → 本地与云端自动同步 → 确保跨设备一致性**

**3\. 技术栈与理由**

| **技术** | **用途** | **选择理由** |
| --- | --- | --- |
| Vue3 + Composition API | 前端 UI 组件 | 响应式强、适合移动端 SPA |
| LeanCloud | 用户管理 + 数据库 | 无需自建服务，快速开发云端同步 |
| LocalStorage | 本地缓存 | 加快加载速度、支持离线使用 |
| reactive/ref/computed | Store 核心 API | 简洁、高性能、易维护 |

**4\. 核心数据结构设计**

store.js 定义了关键状态：

state = {

currentAnimalId: 'RABBIT',

todayMood: 'UNKNOWN',

historyRecords: \[ { date, mood } \],

accessoryInventory: { id: { unlocked, equipped, requiredDays } },

continuousDays: 0,

feedbackMessage: '',

user: null

}

**4.1 用户信息**

- 登录/注册由 LeanCloud 托管
- user.id 用于绑定各用户的数据表

**4.2 心情记录历史表（UserMoodRecord）**

{

userId: String,

date: "2025-02-16",

mood: "HAPPY"

}

按日期唯一。

**4.3 用户档案表（UserProfile）**

{

userId: String,

currentAnimalId: "RABBIT",

accessoryInventory: { ... }

}

用于跨设备同步饰品与动物。

**5\. 功能设计**

**5.1 用户注册 & 登录**

- 使用 email + password 完成注册
- 登录后自动加载：
    - 云端心情历史（UserMoodRecord）
    - 云端用户档案（UserProfile）
    - 本地缓存（按 userId 区分）
- 统一构建完整状态

**Register：**

registerByEmail(email, password)

→ LeanCloud 注册

→ 初始化新用户数据

→ 上传 profile

**Login：**

loginByEmail(email, password)

→ 加载云端 mood

→ 加载云端 profile

→ 加载 localStorage

**5.2 心情记录系统**

每天记录一次心情，写入云端：

recordMood(mood)

→ 创建或更新云端 UserMoodRecord

→ 更新本地 historyRecords

→ 更新连续天数 continuousDays

→ 检查是否解锁奖励

心情数据支持跨设备同步。

**5.3 连续天数 & 奖励系统**

checkReward():

for each accessory:

if (days >= requiredDays && 未解锁)

解锁饰品

弹出奖励提示

实现了类似游戏成长感。

**5.4 小动物管理系统**

- 当前小动物：currentAnimalId
- 可切换动物（如 Rabbit、Cat、Dog）
- 切换动物会取消当前佩戴的饰品
- 小动物会根据当天 mood 展示不同对话：

getAnimalDialogue()

→ 读取 ANIMAL_DIALOGUE\[animalId\]\[mood\]

**5.5 饰品系统**

- 每个饰品包含：
    - 名称
    - 所需连续天数 requiredDays
    - 已解锁 unlocked
    - 是否佩戴 equipped

用户可以：

- 解锁饰品（自动）
- 点击饰品佩戴
- 保存到云端（UserProfile）

**6\. 本地缓存机制**

为了让用户：

- 打开 APP 秒加载
- 离线也能使用

实现了 LocalStorage 用户隔离：

companionApp_state_&lt;userId&gt;

缓存内容包括：

- 心情历史（减少云查询）
- 连续天数
- 小动物 id
- 饰品状态

避免不同用户之间数据互串。

**7\. 云端同步设计**

**7.1 设计目标**

- 保证多设备一致性
- 避免覆盖云端数据
- 首次登录时合并 localStorage

**7.2 同步流程**

**登录流程：**

1\. 从云端加载 mood

2\. 从云端加载 profile

3\. 将云端数据写入本地 LocalStorage

4\. 同步 todayMood

**记录心情：**

云端 → 立即写入

本地 → 缓存备份

**切换动物或饰品：**

本地修改

→ 本地保存

→ 云端 profile 更新

**8\. 状态管理（store.js）结构**

按模块划分：

| **模块** | **功能** |
| --- | --- |
| 工具函数 | 格式化日期、工具逻辑 |
| 响应式状态 | 所有 UI 要用到的数据 |
| LocalStorage 管理 | 按用户 ID 缓存 |
| LeanCloud 交互 | mood 记录与 profile 同步 |
| 登录/注册模块 | 用户账号系统 |
| 连续天数模块 | 计算天数、触发奖励 |
| 动物与饰品 | 切换动物 / 佩戴饰品 |
| 小动物对话 | mood → 对话选择器 |

结构清晰，职责分明。

**9\. 可扩展性分析**

代码结构允许未来轻松扩展：

✔ 增加更多小动物  
✔ 增加更多饰品与任务系统  
✔ 增加签到系统、等级系统  
✔ 增加聊天/心理支持功能  
✔ 增加云端统计（周心情报告等）

**10\. 总结**

系统已经具备成熟 APP 的核心特性：

- 完整用户体系（注册/登录/登出）
- 云端 + 本地双数据源同步
- 游戏化奖励机制（连续天数解锁饰品）
- 虚拟角色互动系统
- 数据持久化与跨设备一致性
- 清晰可维护的 Store 逻辑

整个项目体现了：

- **前端状态管理能力**
- **云端数据设计能力**
- **用户体验设计能力**
- **跨端项目的工程结构能力**

是一个非常完整的移动端心理健康类应用 Demo。