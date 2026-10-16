# 导入抽奖结果组件验证

在仓库根目录启动：

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

预览地址：`http://127.0.0.1:8767/tests/importcj-result/`。
支持参数 `?count=10`、`?count=31`、`?count=12&kind=long`、`?count=13&kind=groups`、`?kind=message`、`?zoom=1.5`。
所有中奖数据均为本地模拟数据；预览不加载控制器、不调用业务接口。

在已建立的 Ego task space 中执行，替换数字为当前空间 ID：

```sh
{ printf 'globalThis.RESULT_TEST_SPACE=12;\n'; cat tests/importcj-result/browser-checks.mjs; } | ego-browser nodejs
{ printf 'globalThis.RESULT_TEST_SPACE=12;\n'; cat tests/importcj-result/motion-checks.mjs; } | ego-browser nodejs
```

验证覆盖：

- 6 种容器尺寸 × 12 种人数，共 72 个布局组合；逐页检查边界、字号、字段溢出及中奖名单完整性。
- 主字段选择、其他字段顺序与去重、空值回退、前导零、文本安全、源数据不被修改。
- 多奖项标题与分页；公共留言/头像组件保留原显示。
- 实际轮播计时、手动翻页暂停、查看记录后返回、关闭结果与销毁清理。
- CSS zoom、控制坞底部避让、极长字段完整换行滚动及 reduced-motion。

## 后台配置

配置表单沿用已有 `styleconfig`：`resultmainfield`（1～4，默认 1）、`resultextra1/2/3`（auto / 0 / 1～4）、`resultinterval`（4～60 秒，默认 8）。
默认主字段为第一个导入字段，其他字段沿用原顺序；所有选中字段保留，不显示字段名称，不额外解除隐私遮罩。
新增配置不是本地存储，也不涉及数据库迁移。由于本地缺少 PHP 运行环境且现有控制器加密，本次不能确认服务端是否完整保存这些 styleconfig 键。测试环境仍需验证：保存配置、刷新回读、打开大屏后字段和停留时间生效。

## 文件与范围

- `screenimportcj-stage-ui.js`：导入抽奖专用适配层，共享舞台组件未修改。
- `screenimportcj-result.js`：字段映射、独立结果视图、布局、分页、动画生命周期。
- `screenimportcj-stage-ui.css`：仅适配层启用时应用的金色结果样式。
- `screenimportcj.js`：仅传入已有风格配置。
- `importcjresultconfig.html` 和后台 index include：结果展示设置。

超长内容在单卡也无法完整容纳时保持最低字号、换行并允许卡片滚动；不会截断或静默隐藏字段。实际投影距离下的可读性仍需现场验收。

## 缩放与主题修正

结果层透明，沿用页面现有背景；控制坞完全使用公共组件原有样式。
横屏列数按当前容量固定：1/2/3 人分别 1/2/3 列，4 人 2 列，5～6 人 3 列，7～8 人 4 列，9～10 人 5 列，11～12 人 4 列。竖屏 1～3 人 1 列，更多人 2 列；只有最低字号无法满足时降低分页容量。
卡片宽度 =（安全内容区宽度 − 列间距总和）÷ 列数，单人卡另有宽度上限。同一轮所有奖项、所有分页共用一套卡片宽高和字号，按整轮内容及最大奖项人数计算；末页不足时居中，不放大。窗口尺寸变化时统一重新计算，缩放不重播进入动画。

`resize-checks.mjs` 验证 228 个连续宽度场景、跨奖项与末页实际卡片尺寸和字号一致、透明背景和控制台与公共组件样式一致。
