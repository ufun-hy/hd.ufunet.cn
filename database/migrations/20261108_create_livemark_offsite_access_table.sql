-- 评分场外分数功能权限：管理员在活动信息 -> 特殊设置中开启后，活动所属用户才能使用场外分数。
-- 没有记录视为关闭；关闭后轮次编辑页不显示场外分数，保存与计分都不生效（已录入的数据保留）。
-- 回滚（仅在确认不需要保留该表数据时）：
-- DROP TABLE `mibov3_huodong_livemark_offsite_access`;
CREATE TABLE IF NOT EXISTS `mibov3_huodong_livemark_offsite_access` (
    `huodong_id` INT UNSIGNED NOT NULL COMMENT '活动ID',
    `open` TINYINT(1) NOT NULL DEFAULT 2 COMMENT '场外分数功能：1开启，2关闭',
    `updated_at` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`huodong_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分场外分数功能权限';
