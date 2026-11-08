-- 评分大屏主持人亮分：1 开启（切换选手时先隐藏得分，主持人点击“得分统计中”或按回车后公布），2 关闭。
-- 默认值为 2，确保现有活动升级后行为保持不变。
-- 回滚（仅在确认不需要保留该新字段数据时）：
-- ALTER TABLE `mibov3_huodong_configlivemark` DROP COLUMN `revealscore`;
ALTER TABLE `mibov3_huodong_configlivemark`
    ADD COLUMN `revealscore` TINYINT(1) NOT NULL DEFAULT 2
    COMMENT '大屏主持人亮分：1开启，2关闭'
    AFTER `showdecscore`;
