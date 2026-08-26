# Final report — 淘宝前端大屏主图

## Outcome

完成 6 张 1440×1440 淘宝主图：扫码抽奖 2 张、导入名单抽奖 2 张、大屏互动游戏 2 张。

最终方向只展示买家可见的前端大屏效果：参与池、中奖揭晓、名单滚动、照片名单墙、四玩法矩阵和互动竞速排名。会场实拍、操作流程和管理后台均已排除。

## Model workflow

- Gemini Web Pro：生成和修订提示词；共两次纠偏，最终版本为 `deliveries/gemini-prompts-frontend-screen-only.md`。
- ChatGPT Web “创建图片”：生成无文字前端大屏底图。没有将 Luna 用作图像生成路径；页面上可验证的图像工具标签为“创建图片”，不推断其底层模型名称。
- 本地确定性处理：叠加中文标题、副标题和功能标签，导出 PNG/JPG 与 360×360 缩略图。

## Deliverables

- 成品目录：`marketing/taobao-frontend-screen-20260805/deliverables/`
- 总览：`marketing/taobao-frontend-screen-20260805/contact-sheet-1260.jpg`
- 移动端总览：`marketing/taobao-frontend-screen-20260805/contact-sheet-mobile-1080.jpg`
- 可复现脚本与文案：`marketing/taobao-frontend-screen-20260805/src/`
- 来源与边界：`marketing/taobao-frontend-screen-20260805/manifest.json`
