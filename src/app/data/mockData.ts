export interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  date: string;
  rating?: number;
}

export interface Recipe {
  id: string;
  type: 'recipe';
  title: string;
  image: string;
  likes: string | number;
  author: string;
  avatar: string;
  height?: number;
  description: string;
  time: string;
  difficulty: string;
  nutrition: {
    calories: number;
    protein: string;
    fat: string;
    carbs: string;
  };
  ingredients: string[];
  steps: string[];
  comments: Comment[];
}

export interface Restaurant {
  id: string;
  type: 'restaurant';
  title: string;
  image: string;
  likes: string | number;
  author: string;
  avatar: string;
  height?: number;
  address: string;
  rating: number;
  hours: string;
  phone: string;
  description: string;
  comments: Comment[];
}

export const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    user: '美食爱好者',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    content: '按照步骤做出来很成功！家人都说好吃，谢谢分享！',
    date: '2天前',
    rating: 5,
  },
  {
    id: '2',
    user: '小厨娘',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    content: '味道不错，就是火候需要多练习几次才能掌握好。',
    date: '5天前',
    rating: 4,
  },
  {
    id: '3',
    user: '厨房新手',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
    content: '步骤很详细，新手也能轻松上手！',
    date: '1周前',
    rating: 5,
  }
];

export const RECIPES: Recipe[] = [
  {
    id: '1',
    type: 'recipe',
    title: '🥑 牛油果大虾沙拉，减脂期的完美选择，清爽又好吃！',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60',
    likes: '1.2k',
    author: 'HealthyLife',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60',
    height: 220,
    description: '这道牛油果大虾沙拉不仅颜值高，而且营养丰富，低脂健康，非常适合减脂期食用。牛油果的绵密口感搭配鲜嫩的大虾，清新爽口。',
    time: '15分钟',
    difficulty: '简单',
    nutrition: {
      calories: 320,
      protein: '25g',
      fat: '15g',
      carbs: '12g',
    },
    ingredients: [
      '牛油果 1个',
      '鲜虾 8-10只',
      '圣女果 6个',
      '苦菊 适量',
      '柠檬 半个',
      '黑胡椒 适量',
      '橄榄油 1勺'
    ],
    steps: [
      '将鲜虾去壳去虾线，煮熟备用。',
      '牛油果去皮切块，圣女果对半切开。',
      '苦菊洗净沥干水分，铺在盘底。',
      '将处理好的虾仁、牛油果、圣女果放入盘中。',
      '挤入柠檬汁，淋上橄榄油，撒上黑胡椒碎拌匀即可。'
    ],
    comments: MOCK_COMMENTS,
  },
  {
    id: '2',
    type: 'recipe',
    title: '🍳 0失败！超嫩滑的流心蛋做法大公开',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?w=800&auto=format&fit=crop&q=60',
    likes: '892',
    author: 'ChefJohn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    height: 180,
    description: '想吃日式拉面里的流心蛋吗？其实在家也能轻松做！只要掌握好时间和温度，你也做做出完美的流心蛋。',
    time: '10分钟',
    difficulty: '中等',
    nutrition: {
      calories: 140,
      protein: '12g',
      fat: '10g',
      carbs: '1g',
    },
    ingredients: [
      '鸡蛋 2个',
      '酱油 50ml',
      '味淋 30ml',
      '水 100ml',
      '糖 1勺'
    ],
    steps: [
      '将鸡蛋恢复至室温，烧一锅开水。',
      '水开后放入鸡蛋，转中小火煮6分30秒。',
      '煮好后立即放入冰水中冷却。',
      '混合酱油、味淋、水和糖制成卤汁。',
      '鸡蛋剥壳后放入卤汁中浸泡过夜即可。'
    ],
    comments: MOCK_COMMENTS,
  },
  {
    id: '3',
    type: 'recipe',
    title: '🥞 周末早餐：蓝莓松饼配枫糖浆',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=60',
    likes: '2.3k',
    author: 'SweetTooth',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
    height: 200,
    description: '松软香甜的蓝莓松饼，搭配甜美的枫糖浆，是周末早餐的完美选择。',
    time: '25分钟',
    difficulty: '简单',
    nutrition: {
      calories: 450,
      protein: '8g',
      fat: '18g',
      carbs: '65g',
    },
    ingredients: [
      '低筋面粉 150g',
      '牛奶 120ml',
      '鸡蛋 1个',
      '蓝莓 50g',
      '泡打粉 3g',
      '糖 20g',
      '黄油 15g'
    ],
    steps: [
      '将面粉、泡打粉、糖混合过筛。',
      '鸡蛋打散，加入牛奶和融化的黄油拌匀。',
      '将液体倒入粉类中，轻轻搅拌至无干粉。',
      '平底锅小火预热，刷一层薄油。',
      '倒入面糊，撒上蓝莓，煎至表面冒泡翻面。',
      '两面金黄即可出锅，淋上枫糖浆食用。'
    ],
    comments: MOCK_COMMENTS,
  },
  {
    id: '4',
    type: 'recipe',
    title: '家庭版红烧肉做法，零失败！',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
    author: '张大厨',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
    likes: 2341,
    height: 240,
    description: '肥而不腻，入口即化的红烧肉，是每个家庭餐桌上的常客。',
    time: '90分钟',
    difficulty: '困难',
    nutrition: {
      calories: 500,
      protein: '20g',
      fat: '45g',
      carbs: '10g',
    },
    ingredients: [
      '五花肉 500g',
      '冰糖 20g',
      '生抽 2勺',
      '老抽 1勺',
      '姜片 5片',
      '八角 2个',
      '料酒 2勺'
    ],
    steps: [
      '五花肉切块，冷水下锅焯水去腥。',
      '锅中不放油，放入五花肉煸炒出油脂，盛出备用。',
      '锅留底油，放入冰糖炒出糖色。',
      '放入五花肉翻炒均匀上色，加入姜片、八角。',
      '加入料酒、生抽、老抽翻炒。',
      '加入没过肉的开水，小火炖煮60分钟。',
      '大火收汁即可。'
    ],
    comments: MOCK_COMMENTS,
  },
    {
    id: '5',
    type: 'recipe',
    title: '今日份健康早餐打卡☀️',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=60',
    likes: '67',
    author: 'MorningVibes',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
    height: 190,
    description: '简单快手的健康早餐，开启元气满满的一天！',
    time: '10分钟',
    difficulty: '简单',
    nutrition: {
      calories: 300,
      protein: '15g',
      fat: '10g',
      carbs: '40g',
    },
    ingredients: [
      '全麦面包 2片',
      '鸡蛋 1个',
      '牛奶 1杯',
      '水果 适量'
    ],
    steps: [
      '全麦面包烤至酥脆。',
      '鸡蛋煎熟或煮熟。',
      '水果切块。',
      '搭配牛奶一起享用。'
    ],
    comments: MOCK_COMMENTS,
  },
  {
    id: '6',
    type: 'recipe',
    title: '超好吃的日式拉面🍜',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=60',
    likes: '321',
    author: 'RamenLover',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    height: 210,
    description: '浓郁的骨汤，劲道的面条，在家也能还原拉面馆的味道。',
    time: '4小时',
    difficulty: '困难',
    nutrition: {
      calories: 600,
      protein: '25g',
      fat: '20g',
      carbs: '80g',
    },
    ingredients: [
      '猪骨 1kg',
      '拉面 200g',
      '叉烧肉 适量',
      '海苔 2片',
      '葱花 适量'
    ],
    steps: [
      '猪骨焯水洗净，放入大锅中加水熬煮4小时以上，直至汤色奶白。',
      '煮面条，捞出放入碗中。',
      '加入熬好的骨汤。',
      '摆上叉烧肉、海苔、葱花等配料。',
      '根据口味加入酱油或味噌调味。'
    ],
    comments: MOCK_COMMENTS,
  }
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    type: 'restaurant',
    title: '周末探店｜这家云南菜真的绝绝子！',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    author: '吃货小王',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    likes: 128,
    height: 220,
    address: '朝阳区三里屯路19号院太古里南区3层',
    rating: 4.8,
    hours: '11:00-22:00',
    phone: '010-12345678',
    description: '这里的汽锅鸡汤鲜味美，菌菇拼盘更是必点！环境非常有特色，仿佛置身于云南的民宿中。服务员也很热情，强烈推荐！',
    comments: MOCK_COMMENTS,
  },
  {
    id: '3',
    type: 'restaurant',
    title: '三里屯这家西餐环境太好了吧',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    author: '探店达人',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    likes: 456,
    height: 200,
    address: '朝阳区三里屯北路81号那里花园4层',
    rating: 4.6,
    hours: '10:00-23:00',
    phone: '010-87654321',
    description: '露台风景绝佳，适合约会拍照。牛排煎得恰到好处，意面也很入味。晚上的氛围感拉满！',
    comments: MOCK_COMMENTS,
  }
];

// Helper to find item by ID (searching both arrays)
export const findItemById = (id: string) => {
  const recipe = RECIPES.find(r => r.id === id);
  if (recipe) return recipe;
  
  const restaurant = RESTAURANTS.find(r => r.id === id);
  if (restaurant) return restaurant;
  
  return null;
};
