-- Run after deploying code that handles custom style IDs 10, 11, and 12.
-- 5 and 6 are used by the vendor's 5.3.8 styles. Take a fresh table backup first.
-- Precheck on 2026-11-06: old IDs 5/6/7 = 3/100/2 rows, new IDs 10/11/12 = 0.

UPDATE mibov3_huodong_configimportcj
SET styleconfig = JSON_SET(
    styleconfig,
    '$.flytype',
    CASE JSON_UNQUOTE(JSON_EXTRACT(styleconfig, '$.flytype'))
        WHEN '5' THEN '10'
        WHEN '6' THEN '11'
        WHEN '7' THEN '12'
    END
)
WHERE JSON_VALID(styleconfig) = 1
  AND JSON_UNQUOTE(JSON_EXTRACT(styleconfig, '$.flytype')) IN ('5', '6', '7');

SELECT ROW_COUNT() AS migrated_rows;
SELECT JSON_UNQUOTE(JSON_EXTRACT(styleconfig, '$.flytype')) AS style_id, COUNT(*) AS rows
FROM mibov3_huodong_configimportcj
WHERE JSON_VALID(styleconfig) = 1
  AND JSON_UNQUOTE(JSON_EXTRACT(styleconfig, '$.flytype')) IN ('5', '6', '7', '10', '11', '12')
GROUP BY style_id ORDER BY style_id;
