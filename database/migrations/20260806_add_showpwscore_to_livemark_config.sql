-- 大屏专家评委分数显示开关：1 显示分数，2 仅显示评分状态。
-- 默认值为 1，确保现有活动升级后行为保持不变。
ALTER TABLE `mibov3_huodong_configlivemark`
    ADD COLUMN `showpwscore` TINYINT(1) NOT NULL DEFAULT 1
    COMMENT '大屏显示专家评委分数：1显示，2仅显示状态'
    AFTER `showpwnum`;
