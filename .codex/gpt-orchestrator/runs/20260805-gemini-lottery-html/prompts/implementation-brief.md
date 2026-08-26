# Gemini HTML implementation brief

## Goal

依据用户已经全部选定的三张 Gemini 主图，写出对应抽奖形式的 HTML 动态效果。交付一个完整、可直接打开的独立 HTML 演示页，在同一页面中包含三套可切换的前端大屏效果：扫码头像抽奖、导入名单抽奖、大屏多人竞速游戏。

## Visual references

1. `marketing/taobao-mainimage-v4-product-screen-20260805/source/gemini/01-qr-lottery.png`
2. `marketing/taobao-mainimage-v4-product-screen-20260805/source/gemini/02-imported-list-lottery.png`
3. `marketing/taobao-mainimage-v4-product-screen-20260805/source/gemini/03-interactive-game.png`

## Product boundaries

- 只呈现买家和现场观众看到的前端大屏效果。
- 不要管理后台、设置表单、操作步骤、手机教程、舞台、主持人、观众或会场场景。
- 三套效果都必须是实际运行的 HTML/CSS/JavaScript 动画，不得把参考图直接当作静态全屏背景，不得使用视频或 GIF 冒充动画。
- 扫码抽奖要表现参与头像池持续流动、中央候选快速切换并最终锁定中奖者。
- 导入名单抽奖要表现多层名单持续滚动、减速并锁定选中结果。
- 互动游戏要表现多名参与者在多赛道中动态竞速、先后冲线并产生排名结果。
- 可以使用演示用姓名和头像占位符，但不得接入真实客户、订单或账号数据。
- 页面需要在 1920×1080 和 1366×768 桌面大屏中完整显示，并在 390×844 设备上提供不溢出的预览布局。
- 保留用户可理解的模式切换与开始/重新播放能力，但不能做成后台控制台。

## Delivery

- 一个完整 HTML 文件，内联 CSS 与 JavaScript，可直接打开预览。
- 代码中不得出现省略号、未实现 TODO 或依赖本地不存在的文件。
- 不修改任何现有生产模板、业务逻辑或接口。
