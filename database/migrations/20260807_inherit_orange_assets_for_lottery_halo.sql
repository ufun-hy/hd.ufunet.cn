-- 星环头像抽奖保留独立的动态 CSS，静态素材位继承“橙色风格”。
-- 仅复制视觉素材字段，不修改主题名、排序、状态、自定义 CSS 和时间字段。
UPDATE `mibov3_sys_lotterystyle` AS `halo`
JOIN `mibov3_sys_lotterystyle` AS `orange`
  ON `orange`.`id` = 6 AND `orange`.`stylename` = '橙色风格'
SET
  `halo`.`leftbg` = `orange`.`leftbg`,
  `halo`.`rightbg` = `orange`.`rightbg`,
  `halo`.`prevone` = `orange`.`prevone`,
  `halo`.`nextone` = `orange`.`nextone`,
  `halo`.`prizebg` = `orange`.`prizebg`,
  `halo`.`addone` = `orange`.`addone`,
  `halo`.`dedeone` = `orange`.`dedeone`,
  `halo`.`startbtn` = `orange`.`startbtn`,
  `halo`.`stopbtn` = `orange`.`stopbtn`,
  `halo`.`closebtn` = `orange`.`closebtn`,
  `halo`.`changeborder` = `orange`.`changeborder`,
  `halo`.`changeangle` = `orange`.`changeangle`,
  `halo`.`luckerborder` = `orange`.`luckerborder`,
  `halo`.`luckerbg` = `orange`.`luckerbg`,
  `halo`.`roundstartbtn` = `orange`.`roundstartbtn`,
  `halo`.`roundluckerbg` = `orange`.`roundluckerbg`,
  `halo`.`roundprizebg` = `orange`.`roundprizebg`
WHERE `halo`.`id` = 8
  AND `halo`.`stylename` = '星环头像抽奖';
