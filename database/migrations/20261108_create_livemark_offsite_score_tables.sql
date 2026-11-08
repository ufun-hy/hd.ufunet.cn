-- 评分场外分数：按轮次配置权重，最终分 = 场内分 × (100 − 权重)% + 场外分 × 权重% + 人工调整分。
-- 使用独立表，不改动原版 livemark 表结构，避免升级时被重置。
-- 回滚（仅在确认不需要保留场外分数据时）：
-- DROP TABLE `mibov3_huodong_livemark_offsite_score`;
-- DROP TABLE `mibov3_huodong_livemark_offsite_rotate`;
CREATE TABLE IF NOT EXISTS `mibov3_huodong_livemark_offsite_rotate` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `huodong_id` INT UNSIGNED NOT NULL COMMENT '活动ID',
    `rotate_id` INT UNSIGNED NOT NULL COMMENT '评分轮次ID',
    `open` TINYINT(1) NOT NULL DEFAULT 2 COMMENT '启用场外分数：1启用，2关闭',
    `weight` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '场外分数占比 0-100',
    `title` VARCHAR(20) NOT NULL DEFAULT '场外分数' COMMENT '显示名称',
    `updated_at` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_rotate` (`rotate_id`),
    KEY `idx_huodong` (`huodong_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分轮次场外分数配置';

CREATE TABLE IF NOT EXISTS `mibov3_huodong_livemark_offsite_score` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `huodong_id` INT UNSIGNED NOT NULL COMMENT '活动ID',
    `rotate_id` INT UNSIGNED NOT NULL COMMENT '评分轮次ID',
    `pfuser_id` INT UNSIGNED NOT NULL COMMENT '参评选手ID',
    `score` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '场外分数',
    `updated_at` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_rotate_pfuser` (`rotate_id`, `pfuser_id`),
    KEY `idx_huodong_pfuser` (`huodong_id`, `pfuser_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分选手场外分数';
