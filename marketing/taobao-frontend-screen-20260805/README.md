# 淘宝前端大屏主图（2026-08-05）

本批素材只展示买家最终看到的前端大屏效果，不包含会场实拍、操作流程或管理后台。

- `deliverables/`：6 张 1440×1440 PNG/JPG 成品。
- `thumbnails/`：6 张 360×360 移动端复核图。
- `contact-sheet-1260.jpg`：六张总览。
- `src/content.mjs`：确定性中文文案与功能词。
- `src/generate-assets.mjs`：排版、导出与联系表生成。
- `manifest.json`：来源、模型表面标签、文案边界与文件映射。

产品方向：扫码抽奖 2 张、导入名单抽奖 2 张、大屏互动游戏 2 张。生成层不含可读文字；中文标题和标签由本地确定性叠加。

## 重新导出

```bash
NODE_PATH=/Users/ufun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node src/generate-assets.mjs
```
