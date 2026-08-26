# Correction required

- Delivery HTML SHA-256: `d8986605d169f161ce74878a7daa05681b00353acf44aeca6881dc1eed6156f1`
- Delivery CSS SHA-256: `d3099a140fb8c7a601c4ae7bb2b64b49514b1be9bc48b286608a2bc796af2b96`
- Baseline HTML SHA-256: `ce4d74f7186afd6cbefd30950dab22e940daba0c457b1ef30f0edba35dede54b`
- Baseline CSS SHA-256: `ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56`

## Failing acceptance items

### AC-01 — 原演示产品入口被删除

Actual: 交付 HTML 把原文件完全替换成只有头像抽奖的页面，删除了原有“扫码头像 / 导入名单 / 多人竞速”三个入口中的后两个。

Expected: 必须基于上传的原始 `gemini-lottery-effects-v2.html` 修改，只重构 `scene-avatar` 并增加三套外围动效；原 `scene-list`、`scene-race` 和三个产品入口必须保留且继续可运行。

### AC-01 / offline restriction — 引入网络资源

Actual: HTML 包含多条 `https://images.unsplash.com/...`，`file://` 离线时背景、奖品和头像会缺失。

Expected: 删除全部 `http://` / `https://` 资源。沿用原文件的本地 `getAvatarSVG` / data URI 头像方案；背景图用内嵌 SVG data URI 或纯本地相对资源，确保单文件离线运行。

### AC-03 / AC-04 — 生产 CSS 使用不存在的 DOM 类

Actual: CSS 使用 `.prize-title`、`.prize-img-container`、`.center-active`、`.per-avatar-node`、`.lottery-lucker-item` 和 `.avatar`，真实模板中均不存在；因此待机、外围动画、结果卡不会生效。

Expected: 生产 CSS 只能使用任务简报已给出的真实类名，包括：

```text
.left-award
.left-prizeimg .prizeimg img
.left-prizename
.left-joinnums
.prize_number / #prize_number
.lottery-title / .title-left / .title-right
.right-reward-box / .right-lucker / .right-luckeravatar / .right-luckername
.lottery-userBox-wrapper
.lottery-userBox-item
.lottery-userBox-avatar
.lottery-luckers-item
.lottery-luckers-img
.lottery-luckers-name
```

中央运行头像是 `.lottery-userBox-wrapper` 中两个 `.box_angle` 之后的第一个动态项，即 `.lottery-userBox-item:nth-child(3)`；外围项从 `:nth-child(n+4)` 开始。

### AC-05 — `.hidden` 状态再次被破坏

Actual: `.lottery-userBox { display:flex!important; }` 会覆盖模板中更早的 `.lottery-userBox.hidden { display:none; }`，导致待机时运行层也显示。

Expected: 不得给基础 `.lottery-userBox` 强制 display；如需显式运行显示，只允许 `.lottery-userBox:not(.hidden) { display:flex; }`，并必须保留 `.lottery-userBox.hidden { display:none!important; }`。

### AC-06 — 减弱动画规则命中不存在的类

Actual: `prefers-reduced-motion` 只处理 `.per-avatar-node`，真实页面无此类。

Expected: 命中 `.lottery-userBox-item:nth-child(n+4)`、星环伪元素和演示页实际外围类。

## Correction scope

请重新交付两个完整代码块：

1. 完整 `gemini-lottery-effects-v2.html`：保留三类产品场景，只重构头像抽奖；三套动效可切换；待机/运行/结果三态可直接操作；零外链。
2. 完整 `screenlottery-halo.css`：基于上传的 496 行现有版本修正，不要退化为只含 150 行的新骨架；使用真实 DOM；默认把“星云漂流”作为生产运行态方案，但保留 A/C 的可选类规则供以后切换。

不要修改 `screenlottery.js`、模板、API 或后台数据。请如实说明未做真实生产浏览器验收。
