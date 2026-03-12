-- Auto-generated SQL script to import recipes
SET NAMES utf8mb4;

-- Ensure a default user exists (ID=1)
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password_hash`, `nickname`, `created_at`) VALUES (1, 'admin', 'admin@example.com', 'placeholder', 'Admin', NOW());

INSERT INTO `recipes` (
    `author_id`, `title`, `cover_image`, `images`, `description`, 
    `cooking_time`, `difficulty`, `cuisine`, `category`, 
    `ingredients`, `steps`, `tags`, `calories`, `nutrition`, `created_at`
) VALUES (
    1, '红烧肉', 'https://i2.chuimg.com/1a2c3d4e5f6g7h8i9j0k.jpg', '["https://i2.chuimg.com/1a2c3d4e5f6g7h8i9j0k.jpg"]', '肥而不腻，入口即化，是一道经典的家常菜。选用五花肉，经过煸炒、炖煮，色泽红亮，香气扑鼻。',
    '90分钟', '中等', '中式', '热菜',
    '[{"name": "五花肉", "quantity": "500g"}, {"name": "冰糖", "quantity": "30g"}, {"name": "生姜", "quantity": "10g"}, {"name": "大葱", "quantity": "1根"}, {"name": "八角", "quantity": "2个"}, {"name": "老抽", "quantity": "1勺"}, {"name": "生抽", "quantity": "2勺"}, {"name": "料酒", "quantity": "2勺"}]', '[{"step": "五花肉切块，冷水下锅焯水，撇去浮沫捞出沥干。", "image": ""}, {"step": "锅中放少许油，加入冰糖小火炒出糖色。", "image": ""}, {"step": "倒入五花肉快速翻炒，使其均匀裹上糖色。", "image": ""}, {"step": "加入葱姜八角炒香，再加入料酒、生抽、老抽翻炒均匀。", "image": ""}, {"step": "加入没过肉的开水，大火烧开后转小火炖煮1小时。", "image": ""}, {"step": "大火收汁，至汤汁浓稠即可出锅。", "image": ""}]', '["家常菜", "下饭菜", "猪肉"]', 450, '{"protein": "15g", "fat": "40g", "carbs": "5g"}', NOW()
);
INSERT INTO `recipes` (
    `author_id`, `title`, `cover_image`, `images`, `description`, 
    `cooking_time`, `difficulty`, `cuisine`, `category`, 
    `ingredients`, `steps`, `tags`, `calories`, `nutrition`, `created_at`
) VALUES (
    1, '番茄炒蛋', 'https://i2.chuimg.com/tomato_egg.jpg', '["https://i2.chuimg.com/tomato_egg.jpg"]', '色泽鲜艳，酸甜可口，营养丰富，是国民级的家常菜。',
    '15分钟', '简单', '中式', '热菜',
    '[{"name": "鸡蛋", "quantity": "3个"}, {"name": "番茄", "quantity": "2个"}, {"name": "葱花", "quantity": "适量"}, {"name": "盐", "quantity": "1勺"}, {"name": "糖", "quantity": "1勺"}, {"name": "食用油", "quantity": "适量"}]', '[{"step": "番茄切块，鸡蛋打散备用。", "image": ""}, {"step": "热锅凉油，倒入蛋液炒熟盛出。", "image": ""}, {"step": "锅中留底油，放入番茄块翻炒出汁。", "image": ""}, {"step": "加入炒好的鸡蛋，加入盐和糖调味。", "image": ""}, {"step": "翻炒均匀，撒上葱花即可出锅。", "image": ""}]', '["快手菜", "家常菜", "素食"]', 120, '{"protein": "8g", "fat": "9g", "carbs": "5g"}', NOW()
);
INSERT INTO `recipes` (
    `author_id`, `title`, `cover_image`, `images`, `description`, 
    `cooking_time`, `difficulty`, `cuisine`, `category`, 
    `ingredients`, `steps`, `tags`, `calories`, `nutrition`, `created_at`
) VALUES (
    1, '宫保鸡丁', 'https://i2.chuimg.com/kung_pao_chicken.jpg', '["https://i2.chuimg.com/kung_pao_chicken.jpg"]', '鲁菜、川菜、贵州菜中都有收录，红而不辣、辣而不猛、香辣味浓、肉质滑脆。',
    '30分钟', '中等', '川菜', '热菜',
    '[{"name": "鸡胸肉", "quantity": "300g"}, {"name": "花生米", "quantity": "50g"}, {"name": "干辣椒", "quantity": "10个"}, {"name": "花椒", "quantity": "20粒"}, {"name": "大葱", "quantity": "1根"}, {"name": "姜蒜", "quantity": "适量"}, {"name": "淀粉", "quantity": "1勺"}, {"name": "豆瓣酱", "quantity": "1勺"}]', '[{"step": "鸡胸肉切丁，加入淀粉、料酒、生抽腌制10分钟。", "image": ""}, {"step": "花生米炸酥备用，调好宫保汁（糖、醋、生抽、淀粉、水）。", "image": ""}, {"step": "热锅凉油，下入鸡丁滑炒至变色盛出。", "image": ""}, {"step": "锅中留底油，爆香干辣椒、花椒、姜蒜。", "image": ""}, {"step": "加入豆瓣酱炒出红油，倒入鸡丁翻炒。", "image": ""}, {"step": "倒入调好的料汁，大火收汁，最后加入花生米和葱段翻炒均匀。", "image": ""}]', '["川菜", "下饭菜", "鸡肉"]', 300, '{"protein": "25g", "fat": "15g", "carbs": "10g"}', NOW()
);
INSERT INTO `recipes` (
    `author_id`, `title`, `cover_image`, `images`, `description`, 
    `cooking_time`, `difficulty`, `cuisine`, `category`, 
    `ingredients`, `steps`, `tags`, `calories`, `nutrition`, `created_at`
) VALUES (
    1, '清蒸鲈鱼', 'https://i2.chuimg.com/steamed_fish.jpg', '["https://i2.chuimg.com/steamed_fish.jpg"]', '保留了鱼肉的原汁原味，肉质细嫩，鲜美可口。',
    '20分钟', '简单', '粤菜', '热菜',
    '[{"name": "鲈鱼", "quantity": "1条"}, {"name": "姜丝", "quantity": "20g"}, {"name": "葱丝", "quantity": "20g"}, {"name": "蒸鱼豉油", "quantity": "2勺"}, {"name": "料酒", "quantity": "1勺"}, {"name": "食用油", "quantity": "2勺"}]', '[{"step": "鲈鱼处理干净，两面改刀，抹上料酒和姜片腌制10分钟。", "image": ""}, {"step": "盘底铺姜葱，放上鲈鱼，水开后上锅蒸8-10分钟。", "image": ""}, {"step": "倒掉盘中的腥水，以此铺上新的姜丝和葱丝。", "image": ""}, {"step": "淋上蒸鱼豉油。", "image": ""}, {"step": "烧热油，淋在葱姜丝上激发出香味即可。", "image": ""}]', '["海鲜", "健康", "蒸菜"]', 150, '{"protein": "20g", "fat": "5g", "carbs": "2g"}', NOW()
);
INSERT INTO `recipes` (
    `author_id`, `title`, `cover_image`, `images`, `description`, 
    `cooking_time`, `difficulty`, `cuisine`, `category`, 
    `ingredients`, `steps`, `tags`, `calories`, `nutrition`, `created_at`
) VALUES (
    1, '酸辣土豆丝', 'https://i2.chuimg.com/sour_spicy_potato.jpg', '["https://i2.chuimg.com/sour_spicy_potato.jpg"]', '酸辣爽口，开胃下饭，是一道非常受欢迎的大众菜肴。',
    '15分钟', '简单', '川菜', '素菜',
    '[{"name": "土豆", "quantity": "2个"}, {"name": "干辣椒", "quantity": "5个"}, {"name": "花椒", "quantity": "10粒"}, {"name": "大蒜", "quantity": "2瓣"}, {"name": "白醋", "quantity": "2勺"}, {"name": "盐", "quantity": "1勺"}]', '[{"step": "土豆切丝，放入清水中浸泡去除淀粉。", "image": ""}, {"step": "干辣椒切段，大蒜切片。", "image": ""}, {"step": "热锅凉油，爆香花椒、干辣椒和大蒜。", "image": ""}, {"step": "倒入沥干水分的土豆丝快速翻炒。", "image": ""}, {"step": "沿锅边淋入白醋，加入盐调味，大火翻炒均匀即可。", "image": ""}]', '["家常菜", "素食", "快手菜"]', 180, '{"protein": "3g", "fat": "8g", "carbs": "25g"}', NOW()
);
