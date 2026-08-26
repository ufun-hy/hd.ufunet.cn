# Gemini 3.6 Flash frontend assignment

你是外部高级前端视觉工程师。Codex 是代码仓库负责人，会独立下载、审核、应用和浏览器验证你的代码。

## Baseline and transport

- Repository: `hd.ufunet.cn`
- Base commit: `aaa80d3e2d0f88bb1b80aba6f2ab51b67095855f`
- Context transport: `targeted_context`
- 附件 1：原始 `gemini-lottery-effects-v2.html`，SHA-256 `ce4d74f7186afd6cbefd30950dab22e940daba0c457b1ef30f0edba35dede54b`
- 附件 2：当前 `screenlottery-halo.css`，SHA-256 `ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56`
- 工作树有其他用户修改；不得假设能访问本地目录或生产服务器。

## Goal

完成“星环头像抽奖”第二版：三套外围头像动画方案、系统背景可见、全新的抽奖前待机页和中奖结果页。只做产品大屏，不做管理后台、操作流程、二维码或场景营销图。

## A. 必须直接修改附件中的原演示 HTML

1. 保留原文件现有的“扫码头像 / 导入名单 / 多人竞速”三个入口，`scene-list` 和 `scene-race` 必须原样可运行；只重构 `scene-avatar`。
2. 扫码头像场景增加三套可切换的非中心头像动效：
   - A 轨道掠过：2–3 条不同椭圆轨道，速度/尺度/透明度分层。
   - B 星云漂流：不规则安全区内深度分层漂移、轻微缩放、柔和拖尾；默认和推荐方案。
   - C 脉冲接力：不规则节点依次发光，偶尔一个头像靠近中心再回退。
3. 三方案在抽奖中真正运动；待机低速克制；结果态外围头像退暗。
4. 扫码头像必须有可操作的待机→运行→结果三态：
   - 待机：星环风格，显示奖项、奖品图片/名称、参与人数、已获奖人数、抽取人数、开始按钮；丢弃旧式左右皮肤视觉。
   - 运行：单个中央候选头像快速切换，外围使用当前方案。
   - 结果：显示奖项/奖品/中奖头像和名字，支持 1 人及 2–8 人，自适应，并有关闭/继续入口。
5. **零外链**：不得出现任何 `http://` 或 `https://`。沿用原文件的 `getAvatarSVG`/data URI；背景图片使用内嵌 SVG data URI。单 HTML 必须由 `file://` 离线打开。
6. 1920×1080 基准，兼容 1366×768、1024×576，无溢出；支持 `prefers-reduced-motion`。

## B. 完整修正生产 CSS

真实背景在 `.main-box` 的兄弟层：

```html
<div class="pc-box"><div class="full-main"><div class="main-box lottery-halo-theme">...</div></div></div>
<div class="pcbgBox"><div class="main-bg">系统图片或视频背景</div></div>
```

`.main-box.lottery-halo-theme` 必须透明；氛围渐变只能是半透明叠层，不能用不透明背景遮住 `.pcbgBox`。

真实非轮次 DOM 只有这些类：

```text
.lottery-wrapper
  .lottery-left
    .left-award
    .left-prizeimg .prev + .prizeimg img + .next
    .left-prizename
    .left-joinnums span
    .prize_number (#prize_decrement, #prize_number, #prize_increment)
    .start-btn
  .lottery-right
    .lottery-title / .title-left span / .title-right span
    .right-reward-box (.right-lucker > .right-luckeravatar + .right-luckername)

.lottery-userBox
  .lottery-userBox-wrapper
    two .box_angle nodes
    dynamic .lottery-userBox-item
      .lottery-userBox-avatar.frotate > img
      p

.lottery-stop-btn

.lottery-luckers
  .lottery-poptitle
  .lottery-popBox-prize
  .lottery-luckers-wrapper
    dynamic .lottery-luckers-item
      .lottery-luckers-img.frotate > img
      .lottery-luckers-name
  .lottery-close-btn
```

约束：

- 不得使用不存在的 `.prize-title`、`.prize-img-container`、`.center-active`、`.per-avatar-node`、`.lottery-lucker-item`。
- 中央运行头像是 `.lottery-userBox-item:nth-child(3)`（前两个节点是 `.box_angle`）；外围从 `:nth-child(n+4)` 开始，最多 12 个动态头像。
- 默认生产运行态采用方案 B；保留 `.halo-motion-orbit` 和 `.halo-motion-pulse` 可选规则，但不得要求修改业务 JS 才能显示默认方案。
- 绝对禁止 `.lottery-userBox { display:flex!important; }`，否则会覆盖 `.hidden`。必须保留 `.lottery-userBox.hidden { display:none!important; }`。
- 待机和结果页完全重做，但保留原业务元素、事件目标和信息，不改 `screenlottery.js`、接口或数据。
- 基于附件当前 496 行 CSS 修正，不能退化成只含少量骨架且丢失现有运行态映射。

## Deliverables

1. 简短说明三方案差异、性能取舍和推荐方案。
2. 一个完整 HTML 代码块：完整修改后的 `gemini-lottery-effects-v2.html`，不可省略，不可使用 `...`。
3. 一个完整 CSS 代码块：完整修改后的 `screenlottery-halo.css`，不可省略。
4. 变更文件、实际检查、未检查和风险。不要声称已在真实生产页面验收。

如果单次长度不够，先完整交付 HTML，并明确写“CSS 待续”；不要截断代码块。
