// src/data/constants.js

export const MOODS = {
    HAPPY: { cn: '开心', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
    CALM: { cn: '平静', emoji: '😌', color: 'bg-green-100 text-green-800' },
    TIRED: { cn: '疲惫', emoji: '😴', color: 'bg-gray-200 text-gray-800' },
    ANXIOUS: { cn: '焦虑', emoji: '😟', color: 'bg-red-100 text-red-800' },
    EXCITED: { cn: '兴奋', emoji: '🥳', color: 'bg-pink-100 text-pink-800' },
    UNKNOWN: { cn: '未记录', emoji: '❓', color: 'bg-white text-gray-500' }
};

export const ANIMALS = {
    RABBIT: { id: 'RABBIT', name: '小兔子', emoji: '🐰' },
    CAT: { id: 'CAT', name: '小黑猫', emoji: '🐈‍⬛' },
    PANDA: { id: 'PANDA', name: '小熊猫', emoji: '🐼' },
    DOG: { id: 'DOG', name: '萨摩耶', emoji: '🐕' },
    FOX: { id: 'FOX', name: '小狐狸', emoji: '🦊' },
    HEDGEHOG: { id: 'HEDGEHOG', name: '小刺猬', emoji: '🦔' },
};

export const ANIMAL_DIALOGUES = {
    // 简化: 仅保留 RABBIT 和 CAT 的对话，其余请自行补全或使用默认
    RABBIT: {
        HAPPY: "太棒了！你的快乐感染了我，我们一起去奔跑吧！",
        EXCITED: "哇！感觉到了你的能量，让我们一起跳个舞吧！",
        CALM: "感受到你内心的平静，深呼吸，享受这一刻的宁静吧。",
        TIRED: "摸摸头，辛苦了。现在放松下来，我会在旁边守护你入睡的。",
        ANXIOUS: "没事的，我在你身边！我们数三下，把那些不安都吹走，好吗？",
        UNKNOWN: "你想和我说说今天发生了什么吗？我在听哦。",
    },
    CAT: {
        HAPPY: "喵~ 看到你开心，我也觉得今天的阳光格外好。",
        EXCITED: "兴奋？别忘了也要保持优雅。让我帮你梳梳毛~",
        CALM: "呼噜噜... 靠近我，一起享受这份午后的安宁。",
        TIRED: "不要担心，休息是最好的治愈。让我靠着你，给你温暖。",
        ANXIOUS: "虽然我不太懂，但我会一直听着，你不是一个人在面对。",
        UNKNOWN: "今天的你看起来有点神秘，要不要来点小鱼干？",
    },
    PANDA: {
        HAPPY: "嗝~ 快乐的时候要多吃竹子！给你一个竹叶抱抱！",
        EXCITED: "哇，这比吃笋还让人兴奋！慢点，慢点，注意安全！",
        CALM: "慢慢来，不着急。我在这里，一切都好。",
        TIRED: "累了就趴着吧，把烦恼都忘了。今天不做任何事也没关系。",
        ANXIOUS: "别怕，我会保护你的。那些不好的情绪，让我帮你吃掉！",
        UNKNOWN: "今天还没记录心情呢。快告诉我，你是开心还是想睡觉？",
    },
   DOG: {
    HAPPY: "汪汪~ 太开心了！我也要摇尾巴一起庆祝！",
    EXCITED: "快跑快跑！你的兴奋让我充满能量！",
    CALM: "安静地靠在你身边，感受这份温暖的时光。",
    TIRED: "嗷~ 累了吗？让我陪你休息一下吧。",
    ANXIOUS: "别害怕，我在你身边保护你，不要担心。",
    UNKNOWN: "快告诉我你的心情，我才能知道该怎么让你更开心呀！",
  },
  FOX: {
    HAPPY: "小狐狸开心地眨眼，我们一起去森林探险吧！",
    EXCITED: "跳跃！跳跃！你的兴奋让我忍不住也跳起来！",
    CALM: "悄悄地靠近你，一起享受这份宁静的森林时光。",
    TIRED: "嗅嗅…看来你累了，来让我陪你休息一会儿。",
    ANXIOUS: "不要慌，我会在你身边，悄悄守护你。",
    UNKNOWN: "无论你选择了什么，我都支持你。记录一下心情会更好哦。",
  },
  HEDGEHOG: {
    HAPPY: "小刺猬卷起身体开心地跳舞，你也快快乐乐吧！",
    EXCITED: "哇！你太兴奋了，我的小刺也竖起来了！",
    CALM: "慢慢地伸展开身体，感受这份宁静。",
    TIRED: "嗨…累了吧？让我蜷缩在你身边陪你休息。",
    ANXIOUS: "刺儿竖起来没关系，我会小心地守护你。",
    UNKNOWN: "嗯？你今天有点安静。也许记录下来，就能找到答案。",
  },
};

export const INITIAL_INVENTORY = {
    flower: { id: 'flower', name: '小花', emoji: '🌸', requiredDays: 1, unlocked: true, equipped: false },
    hat: { id: 'hat', name: '小帽子', emoji: '🎩', requiredDays: 3, unlocked: false, equipped: false },
    scarf: { id: 'scarf', name: '小围巾', emoji: '🧣', requiredDays: 5, unlocked: false, equipped: false },
    bowtie: { id: 'bowtie', name: '小领结', emoji: '🎀', requiredDays: 7, unlocked: false, equipped: false },
    glasses: { id: 'glasses', name: '小眼镜', emoji: '👓', requiredDays: 10, unlocked: false, equipped: false },
    crown: { id: 'crown', name: '小皇冠', emoji: '👑', requiredDays: 14, unlocked: false, equipped: false },
};