# 留言抽奖弹幕化改造交付记录

任务：`liuyancj-danmaku-lottery-ui-001`

日期：2026-09-24

状态：本地实现与隔离浏览器回归完成；本次弹幕改造尚未部署。

## 1. 当前留言动画问题

旧 Controller 同时维护留言列表滚动、3D 卡片替换和抽奖状态，视觉更像随机名单卡片；扫码留言公共弹幕另有显示层。旧模板保留大量独立 UI 与动画样式，不利于公共舞台组件和留言互动统一。

本次移除旧 3D 卡片、隐藏留言列表及其定时器、旧结果模板和无展示用途的人数轮询。Socket 留言入口、开奖接口、中奖记录版本控制和 mutation lock 保留。

## 2. 弹幕复用

复用扫码留言原有 `danmuku.js`，该引擎文件未修改。新增 `screen-message-danmaku.js` 作为独立显示适配层，负责消息卡片、轨道投放、加减速和中奖高亮，不调用开奖接口、不选择中奖人。

`fulldm.js` 增加可选显示委托，本页使用同一个开关控制新显示层，避免两套弹幕同时播放。未委托页面继续运行原管理器。保留后台默认开关和活动级本地开关偏好。

消息缓存最多 300 条，实时优先队列最多 30 条，引擎待播队列限制为 12 条；删除和清空同步清理待播消息。昵称以文本渲染，内容仅允许文本和安全图片，保留表情能力。

## 3. 交互流程

- 准备：循环展示历史留言，Socket 新留言优先入场；公共 Prize 与 Stage 正常显示。
- 开始：沿用原 `savelucker` 请求和参数，成功后隐藏礼品卡，弹幕逐步加速。
- 停止：禁用重复操作和奖品切换，弹幕减速并锁定后端返回的中奖留言。
- 高亮：最多同时展示 3 张中奖留言卡，额外人数用提示说明；完整名单交给公共结果。
- 结果：暂停并隐藏弹幕层，显示原公共中奖结果；关闭后恢复准备态和留言流。
- 记录：继续使用公共记录面板及原删除、清空接口。

页面退出时取消动画延迟、显示层定时器及监听器，忽略未完成的初始化与开奖响应。支持减少动态效果偏好。

## 4. 修改文件

生产文件共 6 个：

- `app/screen/view/liuyancj/index.html`
- `public/static/js/screenjs/screenliuyancj.js`
- `public/static/js/screenjs/fulldm.js`
- `public/static/js/screenjs/screen-message-danmaku.js`（新增）
- `public/static/css/screencss/screenliuyancj-prize.css`
- `public/static/css/screencss/screen-message-danmaku.css`（新增）

测试文件：`tests/liuyancj-danmaku/{serve.py,harness.js,browser-checks.mjs}`。

## 5. 公共组件影响

`screen-prize`、`screen-stage-ui` 的 JS/CSS 均未修改。ImportCJ、普通抽奖、巨幕、酷炫 3D、后台配置及数据库未修改。

锁定时仅在留言 Controller 中给 Stage 传禁用状态，Prize 保持 drawing 隐藏状态，避免礼品卡遮住中奖留言。公共弹幕增加的委托行为仅在本页显式启用；其他页面原弹幕管理器的启动、停止、消息入队已经隔离回归验证。

## 6. 测试结果与边界

JavaScript 语法检查及 `git diff --check` 通过。隔离浏览器 19 项检查通过：

1. 准备态真实 Danmuku 轨道、唯一 Prize/Stage、无旧 3D。
2. Socket 去重、缓存上限、HTML 安全渲染及审核删除。
3. 公共弹幕开关委托，不启动第二个管理器。
4. 原开奖接口仅调用一次、重复开始拦截、加速正常。
5. 锁定期间重复停止、奖品切换及记录入口拦截。
6. 高亮使用后端中奖留言，Prize 保持隐藏。
7. 公共结果、一次结果通知、弹幕层完全隐藏。
8. 关闭结果恢复留言流。
9. 记录删除及关闭后剩余数量正确。
10. 清空期间 mutation lock。
11. 奖品 A/B 数量独立。
12. 旧历史响应不覆盖新记录结果。
13. 接口失败恢复准备态。
14. 锁定中销毁不再揭晓结果，动画资源清理。
15. 未委托的 fulldm 原管理器、消息、开关兼容。
16. 空留言接入首条消息，后加载配置正确应用开关。
17. 多人中奖高亮不溢出舞台，礼品不遮挡。
18. 公共结果保留全部中奖人。
19. 无浏览器 JavaScript 错误。

截图核验覆盖准备、抽奖、单人高亮、公共结果；修复预览窗口缩放偏移、锁定礼品遮挡和结果残留弹幕。

测试使用真实前端组件/引擎，业务 API 与 Socket 由本地 fixture 模拟，不触达生产开奖或记录数据。未验证真实微信扫码、线上 Socket 连接、生产中奖接口留言字段及扬声器音频播放，部署后仍需验收。本地保留原音频节点和播放控制链路。

复现：

```sh
python3 tests/liuyancj-danmaku/serve.py
```

打开 `http://127.0.0.1:8766`。在已有 Ego task space 中，将测试脚本的 `globalThis.LIUYAN_TEST_SPACE` 替换为该空间数字 ID，再通过 `ego-browser nodejs` 执行。此预览只使用虚构活动数据。

本次仅恢复 GitHub Desktop stash 内与本任务有关的文件，原 stash 保留，主分支已有评分页修复保持不变。
