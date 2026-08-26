# Engineering assignment

## Role

你是 Gemini 网页版中的高级前端视觉工程师。Codex 是代码仓库负责人，会独立审核、应用和测试你的交付。请以产品大屏本身为中心，不做管理后台、流程图或营销场景。

## Goal

继续完善“星环头像抽奖”：在指定的独立演示文件中完成 3 套可切换的“非中心区域头像动画”方案，同时为真实主题重新设计抽奖前待机态和中奖结果态，并指出生产 CSS 中背景图被遮挡的正确修复方式。

## Baseline

- Repository: `hd.ufunet.cn`
- Base commit: `aaa80d3e2d0f88bb1b80aba6f2ab51b67095855f`
- Working tree: dirty；本任务相关的演示 HTML 和星环 CSS 是未提交的本地版本。
- Context transport: `targeted_context`
- Attached source 1: `gemini-lottery-effects-v2.html`，SHA-256 `ce4d74f7186afd6cbefd30950dab22e940daba0c457b1ef30f0edba35dede54b`
- Attached source 2: `screenlottery-halo.css`，SHA-256 `ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56`
- Provider workspace: existing Gemini lottery visual conversation `https://gemini.google.com/app/40f5bad5bbbced71`

## Product and visual direction

- 这是扫码头像抽奖的大屏效果，不是后台。
- 核心视觉仍是：单个中央动态候选头像、同心蓝紫星环、外围参与者头像。
- 中央头像必须始终是第一视觉主角，外围头像不能形成另一个巨大的球体，也不能像整齐六宫格。
- 整体应比现在更精致、具有真实产品可实现性；不要抽象到脱离现有扫码抽奖产品形态。
- 颜色延续深空黑、科技蓝 `#12b5ff`、紫 `#a93cff`，可少量使用玫红强调。
- 所有头像与名字都使用本地生成/占位数据，不使用真实活动参与者。

## Scope A — modify the attached demo HTML

请直接修改并完整交付 `gemini-lottery-effects-v2.html`：

1. 保留现有“扫码头像 / 导入名单 / 多人竞速”三个产品演示入口，重点重做“扫码头像”。
2. 在扫码头像场景增加 3 个可切换的外围头像动效方案，必须能直接运行和比较：
   - 方案 A：轨道掠过。外围头像沿 2–3 条不同椭圆轨道运动，速度、尺度、透明度存在层次，不能同时挤到中央。
   - 方案 B：星云漂流。外围头像以深度分层的缓慢漂移、轻微缩放和流光拖尾通过画面，运动随机但不凌乱。
   - 方案 C：脉冲接力。外围头像停留在不规则安全区节点，发光脉冲按顺序传递，偶尔有一个头像短暂向中心靠近后退回。
3. 三个方案都必须在“运行中”真正动起来；待机态应低速、克制；结果态外围头像退暗并让中奖人聚焦。
4. 同一个演示中补齐扫码头像的三种完整页面状态：
   - 抽奖前：全新的星环待机页，突出奖项/奖品图片/奖品名称/参与人数/已获奖人数/抽取人数/开始按钮；不保留老式左右大面板视觉。
   - 抽奖中：中央候选头像快速切换，外围按选中的动画方案运行。
   - 中奖结果：全新的星环结果页，显示奖项、奖品、中奖头像和名字，支持 1 人以及 2–8 人的自适应布局，并有清晰关闭/继续入口。
5. 演示中加入可见的背景图片层，并叠加透明深色渐变和星环氛围；不得用不透明纯色/渐变完全盖住图片。
6. 设计基准为 1920×1080，并兼容 1366×768、1024×576；无横纵溢出；支持 `prefers-reduced-motion`。
7. 不引入外部 CDN、框架、字体或网络请求，保持单 HTML 文件可由 `file://` 直接打开。

## Scope B — production CSS recommendation/diff

真实页面的背景结构是兄弟层，而不是 `.main-box` 自身：

```html
<div class="pc-box"><div class="full-main"><div class="main-box lottery-halo-theme">...</div></div></div>
<div class="pcbgBox"><div class="main-bg">系统配置的图片或视频背景</div></div>
```

当前主题错误地在 `.lottery-halo-theme` 上使用了带 `!important` 的不透明 `background` 简写，遮住了 `.pcbgBox`。正确方向应是让 `.lottery-halo-theme` 自身透明，把半透明深空渐变放在伪元素或内容层，同时维持背景可见。

真实非轮次抽奖 DOM 类名如下，必须映射现有结构，不要求改业务 JS：

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
    .title-left span
    .title-right span
    .right-reward-box (.right-lucker...)

.lottery-userBox
  .lottery-userBox-wrapper
    two .box_angle elements
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

现有 `screenlottery.js` 负责待机、开始、停止、填充中奖人和关闭，不在修改范围。请提供可用于 `screenlottery-halo.css` 的完整、作用域严格限定在 `.lottery-halo-theme` 下的 CSS diff 或替换段，重做待机态和结果态，不改接口、不改保存逻辑。

## Acceptance criteria

| ID | Requirement | Verification |
|---|---|---|
| AC-01 | 同一演示文件中可切换 3 套明显不同的外围头像动画 | 分别运行并截图 |
| AC-02 | 系统配置背景图片/视频保持可见 | 检查透明层与真实 DOM 截图 |
| AC-03 | 抽奖前页面完全星环化且保留全部业务信息/控件 | 真实 DOM 待机态检查 |
| AC-04 | 结果页完全星环化，支持 1 人和 2–8 人 | 模拟结果态截图 |
| AC-05 | 不修改业务 JS、API、中奖保存逻辑 | diff 审核和 JS 哈希 |
| AC-06 | 1920×1080、1366×768、1024×576 无溢出，支持减少动态 | 多视口检查 |

## Required deliverables

1. 说明三套动画的差异、性能取舍和你的推荐方案。
2. 提供完整修改后的 `gemini-lottery-effects-v2.html`，不得省略代码或写 `...`。
3. 提供 `screenlottery-halo.css` 的完整 unified diff 或完整替换文件，基于附件哈希版本。
4. 列出变更文件、已做检查、未做检查和剩余风险。

## Restrictions

- 不要声称能直接访问 Codex 本地目录或生产服务器。
- 不得加入后台界面、操作流程、二维码、订单、客户或账号数据。
- 不得修改 `screenlottery.js`、抽奖接口、保存结果或数据库。
- 不得部署、提交、推送或创建 PR。
- 不要用巨大头像球、整齐六宫格、管理后台面板或脱离产品的大幅场景化画面。
