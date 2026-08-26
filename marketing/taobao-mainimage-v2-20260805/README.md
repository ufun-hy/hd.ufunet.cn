# 淘宝抽奖系统主图 V2（2026-08-05）

本目录是“前端大屏效果优先”的第二版淘宝主图素材。

- `source/`：ChatGPT 网页版创建图片产出的无文字底图，参考现有商品主图结构，但不直接复用旧截图。
- `deliverables/`：2048 与 1440 两套成品图，中文标题和标签由本地脚本确定性叠加。
- `thumbnails/`：移动端快速复核小图。
- `contact-sheet-2048.jpg`：三张总览。

本轮策略：

- 不直接使用项目内旧大屏截图，因为清晰度和视觉质感不够。
- 只保留真实产品方向：头像滚动、中奖卡、奖品面板、赛道排名、红包雨、游戏矩阵。
- 生成层不使用可读文字、二维码、价格、商标或后台管理页。
- 最终文案由本地叠加，避免模型乱码。

## 重新导出

```bash
NODE_PATH=/Users/ufun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node src/generate-assets.mjs
```

