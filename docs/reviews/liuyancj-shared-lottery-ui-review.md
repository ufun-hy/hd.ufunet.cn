# 留言抽奖复用公共礼品 / 舞台 UI Review 文档

## 1. Review 对象

项目：ufun-hy/hd.ufunet.cn

分支：main

本次核心实现提交：

f96a7f303b20038dd42c8943dcb14f60acfccd89  
refactor: share lottery stage UI with message draw

本次 Review 前补充修复：

bc7201859e2c2d6b67abe8e5ff978ff8618bf071  
fix: harden message lottery winner counts

前置提交：

ed67513a3450d93eb910459ae0cc5ef2edaa49f8  
refactor: extract shared screen prize component

b899c15d9b5b510ce69bb29eeae4f849763ce187  
refactor: use shared prize component in message lottery

本轮尚未在服务器完成真实页面和开奖验收，当前完成的是代码修改、结构收敛与静态检查。Review 请以当前 main HEAD（bc7201859e2c2d6b67abe8e5ff978ff8618bf071）为准。

## 2. 任务背景

前一轮已经把 ImportCJ 的礼品展示抽成公共 screen-prize.js / screen-prize.css，并让留言抽奖接入了公共礼品组件。

服务器查看后发现，留言抽奖准备态仍然同时显示左侧留言面板、公共礼品组件和右侧中奖名单面板。公共礼品组件属于新的统一抽奖视觉，而左右旧面板和旧开始按钮仍属于旧主题视觉，三者放在一起明显冲突。

因此本轮不再继续单独美化留言抽奖，而是继续收敛公共抽奖 UI：

- 公共礼品组件
- 公共主持控制台
- 公共中奖结果
- 公共中奖记录面板

具体抽奖主题只负责抽奖过程中的动画和表现。

留言抽奖继续保留自己的 3D 留言滚动动画，但准备态、中奖结果和中奖记录统一复用 ImportCJ 已形成的公共体系。

## 3. 修改目标

### 准备态

留言抽奖准备态不再展示左右旧面板。

目标结构：

    screen-prize
    礼品图片 / 奖项 / 礼品名称 / 剩余名额

    screen-stage-ui
    开始抽奖 / 奖品设置 / 中奖记录

页面背景仍然使用留言抽奖自己的后台配置背景。

### 抽奖中

点击公共控制台开始抽奖后：

    READY
      ↓
    /screen/liuyancj/savelucker
      ↓
    DRAWING
      ↓
    继续使用原 liuyan-rolldmmain / rolldmBox 动画

本轮没有重写留言抽奖核心 3D 动画。

### 停止后

停止抽奖后不再使用旧 .liuyan-output 作为主要结果页面。

改为通过 screen-stage-ui.setResult() 显示公共中奖结果。

关闭结果后重新回到公共准备态。

### 中奖记录

准备态不再常驻显示 .liuyancj-right。

点击公共控制台“中奖记录”后：

    /screen/liuyancj/ajaxlucker
      ↓
    screenliuyancj Controller 转换数据
      ↓
    screen-stage-ui.setRecords()

由公共中奖记录抽屉显示。

## 4. 公共 Stage UI 抽离方案

原文件：

- public/static/js/screenjs/screenimportcj-stage-ui.js
- public/static/css/screencss/screenimportcj-stage-ui.css

原本已经承担主控制台、开始/停止、奖品设置入口、中奖记录入口、中奖结果和中奖记录抽屉，但文件名、DOM class 和 CSS 变量仍绑定 ImportCJ。

本轮新增真正公共文件：

- public/static/js/screenjs/screen-stage-ui.js
- public/static/css/screencss/screen-stage-ui.css

公共组件只负责 UI 和交互事件，不负责任何具体抽奖接口。

公共组件不包含：

- /screen/importcj/*
- /screen/liuyancj/*
- savelucker
- dellucker
- 抽奖业务规则
- 留言动画
- ImportCJ 动画

业务通过 callback 交还各自 Controller。

## 5. ImportCJ 兼容方式

为了避免已经服务器验证通过的 ImportCJ 再次大面积改动，没有重写其 Controller 接入方式。

保留：

- screenimportcj-stage-ui.js
- screenimportcj-stage-ui.css

但它们现在是兼容层。

JS 关系：

    screenimportcj-stage-ui.js
      ↓
    screen-stage-ui.js

CSS 关系：

    screen-stage-ui.css
    = 公共视觉

    screenimportcj-stage-ui.css
    = ImportCJ 旧节点隐藏 / legacy-roll 兼容

ImportCJ 页面增加 screen-stage-ui.css。

ImportCJ 原业务接口、抽奖状态机和开奖逻辑没有改变。

控制台底部安全距离变量从 ImportCJ 专属变量切换为公共 --screen-stage-action-bottom。

## 6. 留言抽奖 Controller 如何修改

主要文件：

public/static/js/screenjs/screenliuyancj.js

新增依赖：

screenjs/screen-stage-ui

新增主要状态：

- stageUi
- visualState
- prizeSettingsVisible
- drawRequestPending
- lastDrawWinners
- recordsRequestId
- winnerCountReady

主要状态流：

    ready
      ↓
    requesting
      ↓
    drawing
      ↓
    result
      ↓
    ready

中奖记录状态流：

    ready / result
      ↓
    records
      ↓
    返回进入记录前的状态

公共 Stage UI callback：

- onPrimaryAction
- onPrizeSettingsToggle
- onRecords
- onRecordsClose
- onRecordsRetry
- onRecordDelete

公共组件只发用户操作意图。

真正的开始开奖、停止开奖、请求中奖记录、删除中奖记录仍然全部由 screenliuyancj.js 执行。

## 7. 业务状态不再从旧 DOM 反读

本轮继续遵守：

    UI
      ↓ intent
    Controller
      ↓ state / API
    UI render

留言抽奖主链路已经不再依赖以下旧节点作为业务状态来源：

- .liuyan-startbtn
- .liuyan-output
- .liuyan-luckerlist
- .liuyancj-right ul

当前奖品、抽取人数、剩余名额来自 Controller：

- prizeIndex
- drawCount
- currentWinnerCount
- winnerCountReady

## 8. 剩余名额处理

切换奖品后先将 winnerCountReady 设为 false，然后请求 /screen/liuyancj/ajaxlucker。

中奖人数加载完成之前：

- 剩余名额保持未就绪
- 开始抽奖不能直接进入开奖

加载成功后：

    remaining = prizenum - currentWinnerCount

再同步到 screen-prize 和 screen-stage-ui。

这样可以避免切换奖品后还没读取历史中奖人数就直接开奖。

## 9. 中奖结果数据适配

留言抽奖接口返回的数据结构与 ImportCJ 不一致。

因此字段转换保留在留言 Controller 的 toStageWinners() 中，转换为：

    name
    extras
    recordId

公共 Stage UI 不认识留言抽奖接口字段。

## 10. 中奖记录删除能力

原留言抽奖右侧中奖栏可以删除单条中奖记录。

准备态隐藏右侧旧面板后，为避免直接丢失这一功能，本轮给公共 Stage UI 增加了可选 onRecordDelete 能力。

只有 Controller 提供 callback 且中奖记录存在 recordId 时，公共记录卡才显示“删除”。

留言抽奖删除仍调用：

/screen/liuyancj/dellucker

删除成功后重新刷新公共中奖记录。

ImportCJ 当前没有传入 onRecordDelete，因此不会因为这个能力自动出现删除按钮。

## 11. 旧留言面板的处理

本轮没有直接删除以下旧 DOM：

- .liuyan-welcomeBox
- .liuyancj-center
- .liuyancj-right
- .liuyan-output

原因是左侧留言 DOM 仍被旧消息滚动逻辑使用和测量。

因此左右面板增加 liuyan-legacy-panels：

- DOM 保留
- 尺寸保留
- visibility:hidden
- opacity:0
- pointer-events:none

这样旧留言滚动逻辑仍可以运行，但准备态不输出视觉。

旧中奖弹窗增加 liuyan-legacy-result，并强制退出视觉链路。

后续确认旧节点完全没有业务用途后，可以再做第二阶段删除。本轮不做激进清理。

## 12. 修改文件

新增：

- public/static/js/screenjs/screen-stage-ui.js
- public/static/css/screencss/screen-stage-ui.css

修改：

- public/static/js/screenjs/screenimportcj-stage-ui.js
- public/static/css/screencss/screenimportcj-stage-ui.css
- public/static/js/screenjs/screenimportcj.js
- app/screen/view/importcj/index.html
- public/static/js/screenjs/screenliuyancj.js
- public/static/css/screencss/screenliuyancj-prize.css
- app/screen/view/liuyancj/index.html

## 13. 静态检查结果

针对核心实现 f96a7f303b20038dd42c8943dcb14f60acfccd89 及补充修复 bc7201859e2c2d6b67abe8e5ff978ff8618bf071 已检查：

- screen-stage-ui.js：JS parse PASS
- screenimportcj-stage-ui.js：JS parse PASS
- screenimportcj.js：JS parse PASS
- screenliuyancj.js：JS parse PASS

并确认：

- screen-stage-ui.js 不再包含 importcj-stage-* class
- screen-stage-ui.css 不再包含 .importcj-mainbox 宿主耦合
- screen-stage-ui.css 不再包含 importcj-stage-* 选择器
- ImportCJ 通过兼容入口加载公共 Stage UI
- ImportCJ 页面已加载 screen-stage-ui.css
- 留言抽奖已加载公共 Stage UI
- 留言 Controller 已使用公共 setResult()
- 留言 Controller 已使用公共 setRecords()
- .liuyan-startbtn 在留言 Controller 的业务引用为 0
- .liuyan-output 在留言 Controller 的业务引用为 0
- .liuyancj-right ul 在留言 Controller 的业务引用为 0

## 14. Review 重点

### A. ImportCJ 是否回归

请重点确认：

- 公共 Stage UI 抽离后 ImportCJ callback/API 没有改变
- legacy-roll 的旧中奖滚动节点在 drawing 状态仍可以显示
- Prize Settings / Records / Primary Action 行为和抽离前一致
- CSS class 重命名是否有漏项

### B. 留言抽奖状态机

重点检查：

    ready → requesting → drawing → result → ready

以及：

    ready/result → records → 原状态

是否存在重复触发、状态竞态或按钮提前可用。

### C. 中奖人数一致性

检查初次加载、切换奖品、新增中奖、删除中奖、清空中奖之后：

- currentWinnerCount
- remaining
- drawCount

是否始终一致。

### D. Records 异步请求

重点检查：

- 快速打开 / 关闭 Records
- 删除后立即刷新
- 清空后立即刷新
- 请求返回时当前状态已经变化

是否存在旧请求覆盖新状态的问题。

### E. 旧留言 DOM

确认左右旧面板不可见但保留尺寸后，loopRun() / messageBox / messageList 是否仍能正常工作。

如果隐藏状态下仍有测量问题，应提出替代方案，但不要恢复准备态左右面板。

## 15. 服务器验收项目

代码 Review 后建议服务器测试：

1. ImportCJ 准备态与修改前一致。
2. ImportCJ 开始、停止、结果、中奖记录正常。
3. 留言抽奖准备态只显示公共礼品 + 公共控制台。
4. 留言抽奖不再显示左右旧大面板。
5. 点击“奖品设置”可以展开公共奖品切换/抽取人数。
6. 切换奖品后剩余名额正确。
7. 开始抽奖进入原留言 3D 动画。
8. 抽奖中公共控制台显示停止抽奖。
9. 停止后进入公共中奖结果，不出现旧 liuyan-output。
10. 关闭结果后回到公共准备态。
11. 中奖记录打开公共记录抽屉。
12. 单条中奖记录删除可用。
13. 删除后剩余名额更新。
14. “/” 清空当前奖品中奖记录后剩余名额更新。
15. 空格开始/停止、左右切奖品、上下调整人数继续可用。
16. Socket 新留言仍能进入留言数据和 3D 动画。
17. 1920×1080 下礼品组件与控制台位置和 ImportCJ 基本一致。

## 16. 本轮不处理

本轮不修改：

- 酷炫3D
- 普通抽奖
- 巨幕抽奖
- 后台配置
- 数据库
- 留言抽奖核心 3D 动画

留言抽奖服务器验收和 Review 通过后，再将相同的 screen-prize + screen-stage-ui 逐个接入其余扫码抽奖样式。

## 17. Review 前补充修复：中奖人数计数健壮性

在准备 Review 时继续检查留言抽奖 Controller，发现历史接口 `/screen/liuyancj/ajaxlucker` 的 `e.msg.list` 旧代码长期通过 `$.each` 遍历，因此它既可能是数组，也可能是对象形态。

公共 UI 接入后的首版代码有三处直接使用：

    list.length

如果服务端返回对象而不是数组，会导致：

- currentWinnerCount 变成 undefined
- remaining 计算出现 NaN
- 开始按钮错误禁用或剩余名额显示异常
- 删除 / 新增中奖后的数量状态可能失真

因此在 `screenliuyancj.js` 增加统一：

    countWinners(list)

规则：

- Array：使用 length
- Object：使用 Object.keys(list).length
- 空值 / 其他类型：返回 0

并统一替换以下三处：

1. 切换奖品加载历史中奖记录后的 currentWinnerCount
2. 本轮开奖成功后新增中奖人数
3. 打开中奖记录抽屉后重新同步 currentWinnerCount

补充提交：

    bc7201859e2c2d6b67abe8e5ff978ff8618bf071
    fix: harden message lottery winner counts

这一修复不改变接口、不改变 UI，仅保证 Controller 的“中奖人数 / 剩余名额”状态源稳定。

## 18. 当前 Review 基线

请其他智能体 Review 时不要只看单一 commit diff，建议以：

    main @ bc7201859e2c2d6b67abe8e5ff978ff8618bf071

作为完整基线。

重点文件：

- public/static/js/screenjs/screen-prize.js
- public/static/css/screencss/screen-prize.css
- public/static/js/screenjs/screen-stage-ui.js
- public/static/css/screencss/screen-stage-ui.css
- public/static/js/screenjs/screenimportcj-stage-ui.js
- public/static/css/screencss/screenimportcj-stage-ui.css
- public/static/js/screenjs/screenimportcj.js
- public/static/js/screenjs/screenliuyancj.js
- public/static/css/screencss/screenliuyancj-prize.css
- app/screen/view/importcj/index.html
- app/screen/view/liuyancj/index.html

Review 目标不是重新设计视觉，而是确认：

- 公共组件和业务 Controller 的职责边界是否清楚
- ImportCJ 是否保持兼容
- 留言抽奖准备态是否只输出公共 Prize + Stage UI
- drawing / result / records 状态是否互斥且可恢复
- 异步请求是否存在旧响应覆盖新状态
- remaining / drawCount / currentWinnerCount 是否始终由 Controller 单一状态源维护
- 公共 Stage UI 是否仍残留某个具体抽奖模块的接口或 DOM 依赖

## 19. 2026-09-20 复审反馈修复

复审发现两个异步一致性问题：

1. 删除 / 清空旧奖品请求延迟返回时，可能改写当前另一个奖品的 `currentWinnerCount`。
2. `loadPrizeLuckers()` 与 Records 查询使用独立请求 ID，后发查询虽然返回了更新数据，但更早的历史查询仍可能随后覆盖计数。

本轮继续当前 task / main 修复，没有新建分支或 worktree。

功能修复提交：

    295e8d4343eead17b110c69612e0f1f48fb94ce8
    fix: serialize message lottery winner state

控制门禁补充提交：

    7637431510dead61722bfc549ef24ff00ea6a2ed
    fix: gate prize controls during winner mutation

### 19.1 每个奖品共享数据版本

`screenliuyancj.js` 新增：

- `winnerDataVersions`
- `getWinnerDataVersion(prizeId)`
- `advanceWinnerDataVersion(prizeId)`
- `isWinnerDataVersionCurrent(prizeId, version)`

`loadPrizeLuckers()` 与 `openRecords()` 现在都会在发起查询时推进并捕获同一个奖品的数据版本。

响应只有同时满足以下条件才允许写回 Controller：

- 请求 ID 仍为最新
- 当前奖品仍是该请求的奖品
- 请求捕获的数据版本仍是该奖品最新版本
- Records 读取还要求当前仍处于 records 状态

因此同奖品的后发 Records 查询会使更早的历史查询失效；新增 / 删除 / 清空也会推进版本，使变更前的所有旧读取失效。

### 19.2 删除 / 清空绑定奖品并加 mutation lock

新增：

- `winnerMutationPending`
- `winnerMutationPrizeId`
- `beginWinnerMutation(prizeId)`
- `endWinnerMutation(prizeId)`

删除和清空确认框打开时仍允许用户改变想法并切换奖品，但真正确认执行时会再次检查：

- 当前奖品仍然等于确认框打开时捕获的 prizeId
- 页面状态仍允许执行

如果确认前已经切换奖品，本次操作直接取消，不发送删除 / 清空请求。

一旦变更请求真正发出：

- 锁定奖品切换
- 禁止开始抽奖
- 禁止奖品设置
- 隐藏已展开的奖品设置
- winnerCountReady 变为 false
- 旧 winner / records 查询立即失效

请求成功后不再直接用 `-1` 或 `0` 改写全局计数，而是重新调用权威查询读取当前奖品中奖人数。

请求失败或网络异常时同样重新读取权威计数。

### 19.3 开奖也推进中奖数据版本

`startLottery()` 发起 `savelucker` 前推进当前奖品数据版本并使旧的中奖人数查询失效。

这样可以避免：

    旧历史查询 H
      ↓
    Records 新查询 R
      ↓
    成功开奖 +1
      ↓
    H 最后返回

把开奖后的 3 人错误覆盖回旧的 2 人。

### 19.4 Records 提前关闭恢复

如果 Records 查询还没拿到权威计数就被关闭，并且当前 `winnerCountReady=false`，关闭后会自动重新发起当前奖品的中奖人数读取。

防止 Records 查询被取消后准备态长期停留在“计数未知”。

### 19.5 隔离状态回归

针对复审给出的核心乱序场景已做 Controller 级隔离回归：

#### P2-A

    H 历史查询 → R Records 查询 → R 返回 2
    → 成功抽 1 人 → H 最后返回旧 2 人

结果：

- Records 后计数：2
- 开奖后计数：3
- 旧 H 返回后仍为：3
- remaining：7

#### P1 删除

    奖品 A 删除请求 pending
    → 关闭 Records
    → 尝试切换 B
    → A 删除响应
    → 权威刷新

结果：

- pending 期间切换奖品返回 false
- 当前奖品保持 A
- 删除完成后重新读取
- 权威计数 9
- remaining 1

#### 确认框期间切换

    打开清空 A 确认框
    → 尚未确认时切换到 B
    → 再点击确认

结果：

- 不发送 A 的清空请求
- 当前奖品保持 B
- mutation lock 不会错误开启

#### P2-B

    H 历史查询旧快照 2 人
    → 清空成功
    → H 返回
    → 权威刷新返回 0

结果：

- H 返回时不会恢复旧的 2 人 ready 状态
- 权威刷新后 count=0
- remaining=10

以上为前端隔离环境状态验证，不替代服务器真实接口验收。

### 19.6 复审重点

请下一轮 Review 重点验证：

- 复审 P1、P2 原始复现步骤是否均已不可复现
- mutation pending 时鼠标和键盘是否都不能切奖品
- 删除 / 清空失败时是否能恢复权威计数
- Records 快速打开 / 关闭后是否不会留下永久 `winnerCountReady=false`
- ImportCJ 不受本轮留言 Controller 修复影响

服务器真实验收仍需在代码 Review 通过后执行。
