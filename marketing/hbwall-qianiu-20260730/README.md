# 红包墙千牛宣传素材

## 交付目录

- `deliverables/squares/`：5 张商品主/副图 + 1 张商品视频封面，均为 800×800 JPG。
- `deliverables/details/`：8 张 750×900 JPG 详情页分屏。
- `deliverables/detail-long-750x7200.jpg`：8 屏合并详情长图。
- `product-copy.md`：商品标题、短描述、详情介绍、下单前确认和视频字幕。
- `manifest.json`：尺寸、用途、来源与审阅记录。

`exports/`、`upload/`、`source/`、`source-frames/` 和 `src/` 为制作与复用材料，千牛上传时只使用 `deliverables/` 中的文件。

## 重新生成

```bash
node src/generate-assets.mjs
```

生成器会写入 `exports/svg/`。最终 JPG 已按本次内容导出，不需要在千牛端再次加字。

## 设计约束

- 真实红包墙截图保持比例，不改写其中的奖品名称、编号和 UI。
- 中文营销文案使用确定性 SVG 排版，不由图像生成模型绘制。
- 未宣称价格、销量、客户案例、安装速度、客服期限或未验证功能。

