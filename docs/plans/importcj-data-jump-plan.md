# 数据跳动风格接入计划（基于当前舞台代码）

日期：2026-10-18。状态：2026-10-19 已完成本地实现和隔离验证，提交及发布状态以部署记录为准；真实后台保存/回读及完整活动环境验收待完成。

实现与验证记录见 [数据跳动风格验收](../reviews/importcj-data-jump-implementation.md)。下文保留原方案作为设计依据，具体接口以当前源码为准。

2026-10-19 补充：已完成现有风格后台配置的本地分组整理，归属及验证见 [配置归属对照](../reviews/importcj-config-ownership.md)。风格7仍待实现，接入时沿用该分组，不再混入旧列表设置。当前结果组件已使用 `screenimportcj-typography.js` 和 `resultfieldscale1～4`，新运行态需复用字段字号比例与文字适配逻辑，并避免每次跳动引起字号抖动。

参考：`/Users/ufun/Downloads/数据跳动抽奖风格演示.html` 与 `files.zip`。附件中的实现建议作为待审查资料，不直接执行。

## 1. 当前结构与已验证事实

| 层 | 当前职责 | 对接约束 |
| --- | --- | --- |
| `screenimportcj.js` | 接口、隐私格式化、开始/停止、音频、业务状态、键盘和候选更新 | 抽奖接口在开始时已经返回中奖名单；停止不再抽取 |
| `screenimportcj-stage-ui.js` | 包装公共舞台，挂载专用结果组件和记录抽屉 | `setResult` 会调用 `setData`；`setState` 仅在 result 时激活结果组件 |
| `screenimportcj-result.js` | 字段选择、标题、布局、分组分页、揭晓、粒子和轮播 | 可复用，但目前没有运行态；重新设置结果会清空揭晓状态和重建卡片 |
| `screen-stage-ui.js` | 公共控制坞、状态、记录基础结构 | 只支持 ready/requesting/starting/drawing/result/records；primaryEnabled 仅在 ready 时生效 |
| `screen-prize.js`（由 importcj-prize 转出） | 准备页奖品展示和数量/奖品选择 | 同样不接受 revealing；非准备状态隐藏奖品面板并锁定选择 |

实际 DOM 是 `.importcj-mainbox > .screen-stage-ui > .import-result`；结果布局测量的是内部 `.screen-stage-ui`，控制坞也是其子节点。新效果必须使用这个容器，不另挂根节点上覆盖结果。

2026-10-18 使用现有 `tests/importcj-result/` 本地隔离预览验证：

- 重复 `ui.setResult` 会替换卡片容器。
- `ui.setState('drawing')` 后结果组件 inactive、hidden。
- `ui.setState('revealing')` 被归一化为 ready，主按钮显示开始抽奖。
- drawing 时 `ui.update({primaryEnabled:false})` 不会禁用主按钮。
- 31 人、两组人数为 2/29、4 字段的当前视口下，容量为 8，分页人数为 `[2,8,8,8,5]`。第一屏不是 `min(总人数,容量)`，也不是分组数量。
- 结果样式包含 gold/transparent/softgold/ivory/custom；透明模式不能靠上层卡片遮住下层卡片。

这些是现状验证，不代表新功能已通过测试。

## 2. 修正前一版计划

1. 风格 7 使用演示的“一次点击停止，自动逐张揭晓”。不继承旧隐藏列表的逐项/逐人停止计数。
   后台 `app/hdmanage/view/configimportcj/editaward.html` 将这两种停止方式明确限定为 flytype=1、普通抽奖。切换到 7 后，历史 stoptype 值保留，但不参与该风格的展示流程。
2. 不再把压缩包 JumpStage 作为第二套覆盖舞台直接接入；同一个 ResultView 管理运行态与结果态的卡片。
3. 不新增公共 revealing 状态。揭晓阶段是 ImportCJ 内部子状态，公共组件仍处于 drawing，完成后切换 result。
4. 几何计算只有一个使用方 ResultView 时，不为新模块额外复制或导出 measure。可在文件内部拆出纯计算函数，重点是只有一套计算入口。
5. 运行期 90ms、首张等待 500ms、逐张间隔 `min(420, 2400/首屏人数)` 仅用于风格 7；其他风格保留当前立即揭晓首张与 `min(380,2200/人数)` 的节奏。

## 3. 模块边界和拟定接口

### ResultView：唯一卡片拥有者

保持现有 create/selectFields/appendFields/applyCardBackground 导出和默认行为。增加 opt-in 的运行态接口（名称为拟定）：

- `prepareJump({ candidates, confirmedValues, prize, runId })`：处理已打码数据，建立本轮稳定的分组、分页和字段模型；确认名单只存于 JS，不填入待揭晓 DOM。
- `startJump()`：显示首屏蓝色卡片并开始候选更新。
- `revealJump({ onFirstReveal, onComplete })`：每张卡轮到时替换为确认数据并停止更新，原位切换到既有结果样式；完成通知最多一次。
- `finishJump()`：切到结果阅读态，保留当前卡片和分组对象，接入原分页轮播，不再调用 setData 或重新首屏 render。
- `cancelJump()`：清理运行、揭晓和完成回调；关闭、销毁和开始新轮次均可重复调用。

在 `render` 中分开“建立卡片”“更新卡片内容”“揭晓一张卡”；普通结果流程继续使用原来的隐藏 pending 卡，风格 7 使用可见的 is-jumping 卡。

### Jump 模块：只调度，不拥有舞台

如果抽出 `screenimportcj-jump.js`，仅负责候选抽样、间隔、逐张锁定和取消；通过回调请求 ResultView 更新指定卡片。它不创建第二个 section、不计算布局、不访问控制器、不发送接口请求。DOM、字段和粒子逻辑留在 ResultView。

模块由 ResultView 管理，控制器不再额外保存并管理第二个 jumpStage 实例。

### ImportCJ 专用舞台包装层

- 将 flytype=7 作为选项传入；新增 beginDrawing/revealDrawing/finishDrawing 等桥接方法。
- 改写专用层的激活条件：当前跳动会话存在且公共状态为 starting/drawing/result 时保持结果容器可见；ready/records 时执行对应清理/隐藏。
- 在 shared.update 执行后，统一应用 ImportCJ 的 revealing 门禁：主按钮显示“揭晓中…”并 disabled，同时禁用记录和奖品设置。不能只在点击时禁用一次，因为候选轮询也会同步控制状态。
- 揭晓完成后恢复既有 result 控制坞。公共舞台和公共奖品模块无需增加状态枚举。

## 4. 数据、字段与几何

- 开始接口返回且完成现有隐私处理后，使用确认名单生成本轮模型；不会在停止时重新请求或改变中奖人。
- 候选池使用副本，统一做一次隐私格式化。中奖数据复用已格式化内容，不再次打码。
- 运行时只输出候选字段，禁止将确认中奖内容预置于未揭晓节点的 text/title/aria/data 属性。
- 字段更新按 displayFields 的原字段 index、标签和颜色映射；结构签名改变时仅重建该卡片内部字段节点，外层卡片位置不变。
- 为避免空值回退造成卡片大小跳变，风格 7 在本轮开始时固定布局字段数：取准备好的候选和确认结果的最大实际显示字段数（1～4）。整轮一直使用该数。其他风格仍使用当前中奖数据的最大字段数。
- 这意味着极端情况下（候选有四字段、所有中奖人回退为三字段），风格 7 保留四字段对应的卡片尺寸；文字仍按三字段结果正确显示。这是保证前后不跳位的明确取舍。
- 跳动期使用蓝色背景和浅色内容；揭晓时应用已有 resultcardmode/resultcardcolor 和 fieldcolor。CSS 跳动态规则需要覆盖透明/象牙白等主题的边框、分隔线及颜色，揭晓移除 class 后恢复主题。
- 继续使用当前字号、卡片几何、真实 dock 避让和 CSS zoom 处理；顶部显示同一结果标题区域，图片显示规则保持现有结果规则。
- 不搬入演示背景、测试人数/比例按钮或“共 N 名”标题行；保留实际页面背景、准备页奖品面板和控制坞。

## 5. 分组、分页与缩放

- 使用现有 normalizeWinnerGroups 和分页算法；总人数取所有 winners 之和，首屏卡片数取 pages[0].winners.length。
- 运行和首次揭晓针对首屏；大人数和多奖项的后续页沿用现有结果轮播，直接显示该页确认结果并播放原翻页入场，不重复候选跳动。这是相对最多 10 人演示的扩展规则。
- 风格 7 从最后一张定格后开始计算结果阅读/轮播等待；沿用当前 2500ms 启动缓冲和每 4000ms 翻页机制，不能在未揭晓完成时翻页。
- 普通 resize、dock 位置改变和 CSS zoom：复用现有观察器，同页只重算尺寸，保持卡片节点、锁定数据和揭晓进度。
- 揭晓期间若尺寸变化导致页容量改变，按稳定的 groupIndex + winnerIndex 保存揭晓状态；已揭晓人不再跳动，新进入首屏的未揭晓槽位继续队列。容量减少后不再等待已移出首屏的 DOM；完成条件按当前首屏的未揭晓集合判断。
- 必须在本轮固定归一化对象，避免反复 selectFields 生成新对象破坏 revealedWinners 的身份判断。

## 6. 控制器接入时序

1. `init`：7 在 `flytype > 1` 的 3D 分支前单独分流；创建现有统一奖品和专用舞台，向舞台传入运行模式。
2. `startLottery`：继续校验数量并调用一次 savelucker；7 跳过旧 initrollitem 及旧结果模板生成的展示工作，保留其他风格路径。
3. 返回成功并完成隐私格式化后准备运行数据；仍遵循启动视频时机。7 不启动 changerollitem 隐藏计时器，maxrollnum 不控制新风格卡片数。
4. `startDrawingAnimation`：调用专用舞台 startJump。7 的停止可用条件同时要求原启动保护时间结束且舞台已真正开始，避免视频未结束就可停止、后续 ended 又重启动画。
5. `stopLottery`：7 单独处理；设置内部 jumpPhase=揭晓中后再启动异步揭晓，防止重复空格/按钮。期间 isstart 保持 2、公共 visualState 保持 drawing。
6. 接受停止时结束抽奖音乐，首张揭晓时触发结果音效；专用结果继续屏蔽旧结束视频。回调均绑定本轮 runId，关闭/销毁/新轮次后旧回调失效。
7. 完成回调进入幂等的收尾流程：isstart=3、visualState=result、更新旧容器兼容 class、允许关闭/记录。调用 finishJump，禁止再经普通 setResult 重建首屏。
8. `closeResult`/pagehide：取消所有会话回调并清理。记录页只在 ready/result 可进；返回结果仍静态显示当前页，不重新跳动。
9. 候选轮询增加新人时可更新候选快照，但不能改动确认名单、重建会话或解除已锁定卡片；候选结构需要额外空间时延至下一轮采用，避免本轮尺寸变化。

`reduced-motion` 下显示静态候选，停止后立即填入首屏结果，正常完成业务状态，不保留无意义等待。

页面不可见时暂停候选 tick；drawing 返回时继续当前会话。revealing 时转为静态确认结果并完成该轮 UI 收尾，返回后不重复揭晓，避免后台计时器节流使控制器长期卡在 drawing。此规则仅作用于新风格，且不会重新抽奖。

## 7. 文件改动清单

| 文件 | 改动 |
| --- | --- |
| `public/static/js/screenjs/screenimportcj-result.js` | 共享单个视图、稳定字段/分页模型、运行态和逐张定格接口、生命周期 |
| `public/static/js/screenjs/screenimportcj-stage-ui.js` | 模式参数、激活条件、控制门禁、完成和清理桥接 |
| `public/static/js/screenjs/screenimportcj.js` | 风格分流、会话时序、开始停止收尾、候选快照、旧回调保护 |
| `public/static/js/screenjs/screenimportcj-jump.js`（新增） | 小型运行/揭晓调度器，无独立舞台 DOM |
| `public/static/css/screencss/screenimportcj-jump.css`（新增） | 仅限运行卡片的蓝色样式与脉冲、减少动态效果 |
| `app/screen/view/importcj/index.html` | 仅风格 7 加载新增 CSS |
| `app/common/tpl/web/themes/default/common/importcjstyle.html` | 风格 7 选项及额外设置区隐藏判断 |
| `public/static/images/sys/style/importcj/7.svg`（新增） | 审查后使用附件预览资产 |
| `tests/importcj-result/` | 扩展隔离预览与新风格/控制器测试，保留既有断言 |

现有公共 screen-stage-ui/screen-prize 和停止效果编辑界面不列入本次功能改造。

## 8. 执行顺序与验收

1. 先改 ResultView 内部结构、保持旧路径不变：运行当前布局、字段、主题、缩放及动效检查，建立回归基线。
2. 在隔离预览加入风格 7：证明同一张卡从蓝色跳动原位变成结果，透明主题无叠字；未轮到的人保持候选更新，未提前写中奖内容。
3. 接入真实控制器的 mock 测试：仅一次开始接口、重复停止无效、完成只执行一次、遗留 stoptype=2/3/4 不要求多次点击、不跑隐藏列表定时器、不重新 setData。
4. 接后台入口并检验实际页面的样式加载。服务端保存与回读需可运行的 PHP/登录环境验证；加密控制器不能靠静态文本搜索证明支持 7。
5. 验证 1/3/6/10/20/40 人、1～4 字段、空值回退、字段重排、隐私数据和五种结果主题；轮次包含首组只有 2 人但总人数超过一页的用例。
6. 验证慢启动视频、揭晓中缩放导致容量改变、控制坞移动、切后台、关闭、新一轮、候选更新、减少动态效果、旧回调晚到；所有已定格值都不能重新随机化。
7. 回归原 1/5/6 控制器流程及其他风格结果页，包含记录抽屉与共享留言/头像 UI 的隔离检查。3D 实际页面分流需在完整环境补测。

验收标准：实现演示的逐张停止观感，同时保持现有页面的布局、配置和业务来源；任何时候都只有一套可见卡片，完成后直接成为当前结果页。
