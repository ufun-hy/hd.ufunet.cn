# 评分场外分数计分检查

在 PHP 8.2 和真实的 MySQL 8.4 上运行 `LivemarkOffsiteScoreService` 以及两个场外分数中间件。webman 的 Request/Response 和 think-orm 的 `Db` 由 `stubs.php` 用最小实现替代；数据表通过执行 `database/migrations/20261108_create_livemark_offsite_score_tables.sql` 和 `20261108_create_livemark_offsite_access_table.sql` 建立。

在仓库根目录运行：

```sh
docker network create lmtest
docker run -d --rm --name lmtest-mysql --network lmtest -e MYSQL_ROOT_PASSWORD=test -e MYSQL_DATABASE=hd mysql:8.4
docker run --rm --network lmtest -v "$PWD":/app:ro php:8.2-cli sh -c 'docker-php-ext-install pdo_mysql >/dev/null 2>&1 && php /app/tests/livemark-offsite/test.php'
docker rm -f lmtest-mysql && docker network rm lmtest
```

用例以线上样本为准：选手 7072，人工调整分 +30.12；`getuserdata` 中 `score=17.00`（不含调整分）、`score2=47.12`；排行榜和后台列表中 `score=47.12`（含调整分）。

覆盖范围：
- 保存校验：占比、分数，以及原版保存失败时不写入
- 跨活动隔离
- 详情、排行榜、后台列表的重算结果
- 排行重排序，未评分选手排在最后
- 小数位与原值一致
- 微信模板辅助方法
- 不应改动的接口和响应
- 读不到调整分时保留原排行
- 关闭场外分数后恢复原分数
- 管理员在特殊设置中未开启时：忽略场外字段、不计分，数据保留
- 特殊设置开关的管理员令牌：缺少、错误、换会话、换活动时都不能修改开关

这里不覆盖加密控制器本身、模板编译和大屏渲染，这些仍需在实际环境中验收。
