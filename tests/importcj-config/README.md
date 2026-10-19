# 导入抽奖后台配置隔离检查

使用两个真实入口模板及其共享 partial。测试数据和上传控件由 `fixture.js` 提供，不调用保存、上传或抽奖接口。

在仓库根目录启动静态服务：

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

预览地址：`http://127.0.0.1:8767/tests/importcj-config/?mode=activity&flytype=6`。
`mode=web` 对应系统默认配置，`flytype=1` 至 `6` 对应各初始风格。

在已创建的 Ego task space 中运行（替换空间 ID）：

```js
globalThis.CONFIG_TEST_SPACE = 15;
await import('file:///Users/ufun/code/2026/hd.ufunet.cn/tests/importcj-config/browser-checks.mjs');
```

覆盖两个入口、六种初始风格、适用字段显示、反复切换后所有字段值保留、旧版区折叠时的序列化、弹幕颜色联动、结果配置不重复、键盘选风格不误触上传。

使用生产 `webcore.serializeObject` 函数和真实 jQuery serializeArray 检查提交值。字段增删及字号校验沿用 `tests/importcj-result/field-config-checks.mjs`。

这是前端隔离验证。测试渲染器仅支持本次使用的模板语法，不是 PHP/ThinkPHP 的替代品；真实控件、服务端模板编译及保存回读仍需实际环境验收。
