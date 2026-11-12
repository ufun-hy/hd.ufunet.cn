# 导入抽奖后台配置隔离检查

使用两个真实入口模板及其共享 partial。测试数据和上传控件由 `fixture.js` 提供，不调用保存、上传或抽奖接口。

在仓库根目录启动静态服务：

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

预览地址：`http://127.0.0.1:8767/tests/importcj-config/?mode=activity&flytype=11`。
`mode=web` 对应系统默认配置，`flytype=1` 至 `6` 为服务商风格，`10` 至 `12` 为定制风格。

在已创建的 Ego task space 中运行（替换空间 ID）：

```js
globalThis.CONFIG_TEST_SPACE = 15;
await import('file:///Users/ufun/code/2026/hd.ufunet.cn/tests/importcj-config/browser-checks.mjs');
```

覆盖两个入口、服务商与定制风格选择、适用字段显示、反复切换后所有字段值保留、旧版区折叠时的序列化、弹幕颜色联动、结果配置不重复、键盘选风格不误触上传。

使用生产 `webcore.serializeObject` 函数和真实 jQuery serializeArray 检查提交值。字段增删及字号校验沿用 `tests/importcj-result/field-config-checks.mjs`。

这是前端隔离验证。测试渲染器仅支持本次使用的模板语法，不是 PHP/ThinkPHP 的替代品；真实控件、服务端模板编译及保存回读仍需实际环境验收。

### PHP 模板回归检查

在有 PHP 8.2 和项目依赖的环境执行：

```sh
php tests/importcj-config/template-regression.php
```

可额外传入源码根目录和 vendor 目录。脚本只加载 ThinkPHP 模板引擎，上传控件用无副作用的输入框替代，不启动应用或访问数据库。覆盖两个入口的活动上下文、9 种风格，以及正常值、重复数组、嵌套数组、空数组和零值，共 90 个场景。检查 11 个曾重复提交的设置各输出一次，并验证历史数组取第一个标量、空数组使用默认值。测试缓存保留在输出的临时目录。

2026-11-13：修复模板在服务器 PHP 8.2/ThinkPHP 下通过上述 90 个场景；线上原模板在风格 1 的 `styleconfig[awardsize]` 唯一性检查失败。此检查不替代登录页面和保存回读验收。兼容处理仅影响表单呈现；用户之后正常保存时会提交标量，不批量改写已有活动数据。
