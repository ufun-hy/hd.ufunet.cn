-- 每位现场评分选手的人工加减分原因；既有记录默认不填，继续使用原有文案。
ALTER TABLE `mibov3_huodong_livemarkuser`
    ADD COLUMN `score_reason` VARCHAR(30) NOT NULL DEFAULT ''
    COMMENT '人工加减分原因（大屏胶囊文案）'
    AFTER `basicscore`;
