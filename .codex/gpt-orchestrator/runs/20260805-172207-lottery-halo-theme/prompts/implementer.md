# Engineering assignment

## Role

你是通过 Gemini 网页版工作的资深前端工程师。Codex 是本地仓库负责人，会独立检查、应用、测试并接受或拒绝你的交付。你不能直接访问 Codex 的本地路径；随消息上传的三个源码/视觉文件和本任务说明是唯一可信上下文。

## Goal

在现有“炫酷3D抽奖”（代码模块 `lottery`）中新增一个不替换旧风格的视觉主题，后台风格中文名固定为 **“星环头像抽奖”**。它应当把你在 `gemini-lottery-effects-v2.html` 中设计的第一个“扫码头像抽奖/头像光环”方向，接入现有正式抽奖生命周期。

这不是新建第四个抽奖模块，也不是新增菜单；它是现有 `lottery` 模块中的一个新风格。页面重点是前端大屏最终效果，不要出现管理后台、操作流程图或产品说明页。

## Baseline

- Repository: `hd.ufunet.cn`（Webman + Think Template + RequireJS + jQuery）
- Provider and surface: Gemini 网页版，模型以 Codex 在发送前看到的标签为准
- Base commit: `aaa80d3e2d0f88bb1b80aba6f2ab51b67095855f`
- Working tree: 仓库整体存在其他未发布修改，但本任务的正式源码文件均未修改；上传的 `gemini-lottery-effects-v2.html` 是用户已有的未跟踪视觉参考
- Context transport: `targeted_context`
- Context reference: `context.json` 中三个源码/视觉文件及 SHA-256
- Provider workspace: none；使用独立对话

## Architecture and protected boundaries

1. `app/screen/view/lottery/index.html` 是正式大屏模板，已有奖品区、参与者头像墙、抽奖中头像、中奖结果、轮次抽奖模板。
2. `public/static/js/screenjs/screenlottery.js` 已经完成正式业务生命周期：
   - `/screen/lottery/initdata` 获取扫码参与者和奖品；
   - `/screen/lottery/getmoreuser` 轮询新增参与者；
   - `/screen/lottery/savelucker` 由服务器确定真实中奖者；
   - 停止后调用 `screencore.sendLuckerTpl`，并处理二维码、背景音乐、奖品切换、删除中奖记录、多人及轮次抽奖。
3. 后端 controller、菜单和配置保存逻辑经过 `sg_load` 加密，是绝对保护边界；不得修改、替代或新增后端接口。
4. 后台已有“风格→新增”和 `styleid` 选择。风格表单只保存名称、预览图、图片字段及 `diycss`，不要增加数据库字段。正式模板可以使用 `$pcconfig['style']['stylename']` 判断名称是否严格等于 `星环头像抽奖`。
5. 不得让浏览器用 `mockUsers`、`Math.random` 或任何客户端随机逻辑决定真实中奖者。视觉滚动可以循环参与者，但最终结果必须来自现有 `/savelucker` 响应和现有渲染链路。
6. 不得影响其他风格。新增 CSS 必须以类似 `.lottery-halo-theme` 的根类严格限定作用域。优先复用现有 DOM 类和 `screenlottery.js`，只有确实无法完成状态表现时才最小修改 JS。

## Scope

允许修改：

- `app/screen/view/lottery/index.html`
- 必要时最小修改 `public/static/js/screenjs/screenlottery.js`
- 新增一个仓库原生 CSS 文件，例如 `public/static/css/screencss/screenlottery-halo.css`
- 若绝对必要，可新增一个小型纯视觉 JS 文件，但必须解释为什么 CSS + 现有生命周期不足；不得复制第二套抽奖业务逻辑

只用于理解、原则上不要修改：

- `app/screen/view/common/header_base.html`
- `app/web/view/hdconfig/lottery/index.html`
- `app/web/view/hdconfig/lottery/editstyle.html`
- `marketing/.../gemini-lottery-effects-v2.html`

禁止修改：加密 controller、service、路由、数据库、菜单、依赖/锁文件及所有无关文件。

## Visual and interaction requirements

- 只参考视觉文件中的第一个头像光环方向，不要带入名单老虎机或竞速游戏场景。
- 基准画布为 1920×1080，同时在 1366×768 和 1024×576 保持清晰、无溢出。
- 画面要像真实活动大屏产品：中心头像清晰、外圈多层星环/光轨、背景参与者有空间纵深；不要抽象成看不出抽奖产品的概念海报。
- 空闲态仍能看到当前奖品、抽取人数和已有获奖信息；开始后进入聚焦头像光环；停止后清晰展示服务器返回的中奖头像和昵称。
- 单人中奖突出中心；多人中奖形成规整、自适应的环形或网格结果，不得遮挡昵称；轮次抽奖仍可用。
- 保留现有开始/停止/关闭、键盘、二维码/底栏、音乐和奖品切换行为。
- 不依赖远程图片、字体、CDN 或新 npm/composer 包。允许纯 CSS 渐变、阴影、滤镜和伪元素。
- 提供 `prefers-reduced-motion: reduce` 降级；装饰元素不得拦截点击。
- 不要在生产代码中加入演示控制面板、选项卡、mock 用户、调试按钮或营销文案。

## Acceptance criteria

| ID | Requirement | Verification |
|---|---|---|
| AC-01 | 只有风格名“星环头像抽奖”启用新主题，其他风格零回归 | 模板分支和 diff 审查 |
| AC-02 | 继续使用 initdata/getmoreuser/savelucker，真实中奖者只由服务器决定 | JS 源码和接口契约审查 |
| AC-03 | 开始、运行、停止、结果、关闭、切奖、多人和轮次抽奖复用现有生命周期 | 事件绑定和静态交互验证 |
| AC-04 | 高保真还原头像光环方向且是产品大屏，不是后台或流程图 | 三个 16:9 视口截图审核 |
| AC-05 | CSS/DOM 严格隔离、响应式、无溢出，并有减少动态效果降级 | CSS 和浏览器检查 |
| AC-06 | 无依赖、无远程运行资源、无后端/菜单/schema/无关修改 | changed-file manifest 和 diff |
| AC-07 | 可用的语法和静态检查通过；无法运行的检查如实列出 | 检查记录 |

## Required deliverables

1. 说明假设、选择的接入方式和边界。
2. 给出完整 changed-file manifest。
3. 提供**完整 unified diff**；补丁中不得使用省略号或只给片段。如果网页支持，请同时生成一个可下载的 `lottery-halo-theme.patch` 文件。
4. 说明空闲/运行/中奖/关闭四个状态如何映射现有 DOM 与事件。
5. 列出你实际完成的检查及结果，以及没有完成的检查。
6. 明确剩余风险。

## Restrictions

- 不得声称访问了未上传的本地文件、GitHub、数据库、生产活动或浏览器后台。
- 不得声称运行了你无法运行的测试。
- 不得创建提交、推送、PR、部署或生产配置修改。
- 保持补丁最小，不做无关重构。
- 如果发现仅凭所给文件无法安全完成，请停在完整可审查的最小方案并明确缺失信息，不要虚构接口。
