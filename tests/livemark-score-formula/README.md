# 大屏单人详情得分区预览

直接从 `app/screen/view/livemark/index.html` 提取两段无条件生效的 `<style>` 和单人详情区的 HTML，加载真实的 `public/static/js/screenjs/screenlivemark.js`，再调用 `renderScoreFormula` 渲染 `fixtures.js` 里的场景。改版前的展示（`normal-old`、`pub-old`）只用来对比高度。

在仓库根目录启动静态服务：

```sh
python3 -m http.server 8768 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8768/tests/livemark-score-formula/`。每个场景各用 1920×1080 和 1440×1080（4:3，会命中 `max-aspect-ratio: 3/2` 媒体查询）两个 iframe 渲染，表格中列出：

- 汇总区高度：单人详情区固定高 560px，汇总区为 `minmax(160px, auto)`。超过 160px 会压缩下方评委列表，表格中标红。
- 得分区内容高度：预算约 132px，即 160px 减去上下各 14px 内边距。
- 算式宽度与可用宽度：前者大于后者表示一行放不下，表格中标红。
- 截断的名称：名称最多显示 5 个字，超出部分用省略号，属于预期行为。
- 被裁掉的占比/人数：应始终为 0，标红即有问题。

单独查看某个场景时打开 `frame.html#场景名`，例如 `frame.html#pub-offsite`；切换场景时要带上不同的查询参数，才会重新加载页面。

这是静态预览：模板标签被直接去掉，接口数据来自固定的样例。原版大屏的轮询、主题切换和真实数据仍需在实际环境中验收。
