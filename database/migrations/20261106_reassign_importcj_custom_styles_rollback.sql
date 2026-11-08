-- Use only together with restoring the pre-migration custom-style code.
-- This returns 10/11/12 to 5/6/7. It does not revert any other 5.3.8 changes.

UPDATE mibov3_huodong_configimportcj
SET styleconfig = JSON_SET(
    styleconfig,
    '$.flytype',
    CASE JSON_UNQUOTE(JSON_EXTRACT(styleconfig, '$.flytype'))
        WHEN '10' THEN '5'
        WHEN '11' THEN '6'
        WHEN '12' THEN '7'
    END
)
WHERE JSON_VALID(styleconfig) = 1
  AND JSON_UNQUOTE(JSON_EXTRACT(styleconfig, '$.flytype')) IN ('10', '11', '12');

SELECT ROW_COUNT() AS restored_rows;
