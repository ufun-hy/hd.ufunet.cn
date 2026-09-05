-- 评分大屏是否显示人工加/扣分与最终得分：1 显示，2 仅显示当前得分。
-- 现有活动升级后默认保持显示。
-- 回滚（仅在确认不需要保留该新字段数据时）：
-- ALTER TABLE `mibov3_huodong_configlivemark` DROP COLUMN `showdecscore`;
ALTER TABLE `mibov3_huodong_configlivemark`
    ADD COLUMN `showdecscore` TINYINT(1) NOT NULL DEFAULT 1
    COMMENT '显示扣分与最终得分：1显示，2隐藏'
    AFTER `showpwscore`;
