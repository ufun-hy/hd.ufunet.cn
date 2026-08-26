你是本任务的 Gemini 前端实现者。请基于我提供的现有代码，为“导入名单抽奖”新增一个独立的“弹幕漂浮名单抽奖”主题；请交付可审阅、可直接应用到仓库的 unified diff（或逐个完整变更文件），不要只给概念稿、截图或脱离仓库的 demo。Codex 会在本地审阅、应用和测试你的交付。

## 仓库与基线

- 仓库：`/Users/ufun/code/2026/hd.ufunet.cn`
- 基线 commit：`aaa80d3e2d0f88bb1b80aba6f2ab51b67095855f`
- 工作树有用户未发布的其他改动；你只能涉及本任务列出的目标文件/新文件，不要重写其他改动。
- 当前已有 `flytype=5` 星环名单抽奖主题，必须保持不变。新主题建议使用稳定值 `flytype=6`，中文名称“弹幕漂浮名单抽奖”。不要改中奖接口、中奖数据或原有主题。

## 现有运行链路（必须兼容）

`app/screen/view/importcj/index.html`：当 `flytype == '5'` 时加载 `screenimportcj-halo.css`；根节点是 `.importcj-mainbox normalbox flybox{$flytype}`；运行态由 `.isdrawing`、开奖态由 `.isdrawed` 区分。新主题需要新增自己的 CSS/模块并按 `flytype=6` 加载。

`public/static/js/screenjs/screenimportcj.js`：AMD 模块依赖 `screenjs/screenimportcj-halo`。`init(config)` 设置 `self.flytype`，flytype 5 在 initdata 成功后创建 `screenimportcjHalo.create({root: document.querySelector('.importcj-mainbox')})`；`startDrawingAnimation()` 在 flytype 5 仍调用 `changerollitem()` 维护停止计数，再调用 `haloStage.start(self.getHaloCandidates())`；停止分支仍调用 `stoprollitem()` 或 `stopOnerollitem()`，再 `.removeClass('isdrawing').addClass('isdrawed')`。`getHaloCandidates()` 只返回经 `initonedata()` 脱敏后的首个已配置字段。请为 flytype 6 复用相同状态边界（可独立 `screenimportcjBarrage` 模块），不要改 `/screen/importcj/savelucker`、`/screen/importcj/initdata`、`/screen/importcj/ajaxdatas`、`/screen/importcj/getmoreuser` 的调用/数据契约。

当前星环模块 `public/static/js/screenjs/screenimportcj-halo.js` 只用于 flybox5，结构是 `create({root}).start(values).stop()`，60 个固定节点独立于中奖人数，中心值和外围值都通过已经脱敏的候选名字刷新；停止时 `destroy()` 清理 interval、resize listener、stage。新模块可沿用这个生命周期形状，但不要改这个文件。

## 目标体验

这是大屏运行态，不是后台管理界面：

1. 新主题类似直播/演出中的“弹幕漂浮”：多条姓名弹幕从右向左（允许少量斜向/纵向漂移）持续穿过大屏，分成近景/中景/远景多个 lane，速度、字号、透明度、模糊/发光和起始延迟有层次；运动要优雅、连续、具有艺术吸引力，但不能让画面像固定头像池。
2. 中央区域保留清晰的抽奖中动态候选/当前值，四周弹幕为背景氛围，中心与弹幕保持足够安全间距和对比度。禁止用黑色遮罩、默认静态素材或后台管理内容；不要把中奖人数作为弹幕 DOM 数量。
3. 每个弹幕应定时换名字或由固定 lane 循环刷新，不能让观众误以为只从屏幕上可见的几个名字抽取。候选值只能来自 `getHaloCandidates()` 这类已经脱敏的字段。完整中文姓名/长文本须可读，不能强制只显示一个字符。
4. 开始、停止、逐项停止、开奖后中奖列表、关闭和再次开始必须沿用既有逻辑；新 CSS 只在 `.flybox6.isdrawing` 生效，结果态不能被新主题样式污染。根背景、顶部标题、底部控件和既有静态资源必须保持。
5. 响应既有 1920×1080 大屏缩放和较窄视口；使用 transform/opacity 等合成属性，提供 `prefers-reduced-motion` 降级；停止时无 interval、listener 或 detached DOM 泄漏。

## 你可以修改的范围

- `app/screen/view/importcj/index.html`：新增 flytype 6 CSS link 条件（如有必要，勿删 flytype 5）。
- `public/static/js/screenjs/screenimportcj.js`：最小集成新 AMD 模块、初始化、start、stop；不得触碰中奖接口和其他主题分支。
- `app/common/tpl/web/themes/default/common/importcjstyle.html`：新增主题卡片，预览可使用 `/static/images/sys/style/importcj/6.jpg`（如果不存在请同时新增明确的占位预览资源或沿用本地可验证资源，不要指向不存在地址），点击 6 时隐藏旧 flystyle 参数区；不改变 flytype 1-5。
- 新文件：推荐 `public/static/js/screenjs/screenimportcj-barrage.js` 和 `public/static/css/screencss/screenimportcj-barrage.css`。如需预览图片，单独列出资源。

## 交付格式

先用简短文字说明设计/生命周期，再给完整 unified diff（包括新文件），最后列出：修改文件、未改动边界、静态检查/浏览器测试建议、任何假设或无法验证点。不要声称已部署；不要修改服务器。

## 关键当前片段（仅作上下文，不要复制成独立 demo）

```js
// screenimportcj.js 关键形状
define('screenimportcj', ['screencore', 'layerBox', 'template', 'keyboard', 'anime', 'threejs2', 'tweenjs', 'screenjs/screenimportcj-halo', 'snabbt'], function (..., screenimportcjHalo) {
  // init: self.flytype = config.flytype || '1';
  // if (self.flytype == '5') self.haloStage = screenimportcjHalo.create({root: document.querySelector('.importcj-mainbox')});
  // startDrawingAnimation: flytype 5 -> changerollitem(); haloStage.start(self.getHaloCandidates());
  // stop: flytype 1 or 5 -> stoprollitem/stopOnerollitem; flytype 5 -> haloStage.stop();
});
```

```html
<!-- importcj/index.html 当前主题入口 -->
{if isset($pcconfig['styleconfig']['flytype']) && $pcconfig['styleconfig']['flytype'] == '5'}
<link rel="stylesheet" href="/static/css/screencss/screenimportcj-halo.css">
{/if}
<div class="importcj-mainbox normalbox flybox{$pcconfig['styleconfig']['flytype']??1}{if isset($pcconfig['isroundcj']) && $pcconfig['isroundcj'] =='1'} isroundcj{/if}">
```

提交前请确保是仓库原生修改，`flytype=6` 的新主题不替换星环主题，且接口/中奖逻辑零改动。
