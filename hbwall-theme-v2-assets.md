# 红包墙 v2 分层资源清单

视觉参考：`/Users/ufun/Downloads/d02ae2e4-c4eb-4f68-9107-345b92269a17.png`。

页面不得使用整张设计稿作为背景。活动标题、轮次、红包编号、礼品图、礼品名称、数量、中奖信息、活动 Logo 与二维码均由现有 HTML/CSS/JS 和后台数据动态渲染。

| 图层 | 路径 | 尺寸 | Alpha | 内容约束 |
| --- | --- | ---: | --- | --- |
| 活动背景 | `public/static/images/screen/hbwall-theme-v2/background/hbwall-background.png` | 1920×1080 | 否 | 仅深红氛围、祥云暗纹、光弧、粒子与暗角 |
| 轮次容器 | `public/static/images/screen/hbwall-theme-v2/header/round-bg.png` | 760×100 | 是 | 金边胶囊和两侧礼仪装饰，中央无文字 |
| 红包正面 | `public/static/images/screen/hbwall-theme-v2/packet/front.png` | 420×540 | 是 | 红包主体与纹样，无编号或文字 |
| 红包开启态 | `public/static/images/screen/hbwall-theme-v2/packet/open.png` | 420×540 | 是 | 暖米金礼品卡底，无礼品或文字 |
| 红包编号底 | `public/static/images/screen/hbwall-theme-v2/packet/number.png` | 180×180 | 是 | 深红金环圆底，圆心无数字 |
| 主推礼品卡 | `public/static/images/screen/hbwall-theme-v2/gift/feature.png` | 900×360 | 是 | 台座、聚光、金边和装饰，无礼品或文字 |
| 礼品列表卡 | `public/static/images/screen/hbwall-theme-v2/gift/item.png` | 900×180 | 是 | 深酒红卡底和金边，无礼品或文字 |
| 中奖弹窗底板 | `public/static/images/screen/hbwall-theme-v2/modal/bg.png` | 1000×760 | 否 | 酒红玻璃底、金边和底部暖光，无动态内容 |
| 中奖弹窗光晕 | `public/static/images/screen/hbwall-theme-v2/modal/glow.png` | 1200×900 | 是 | 仅暖金放射光晕 |
| 中奖弹窗粒子 | `public/static/images/screen/hbwall-theme-v2/modal/particle.png` | 1200×900 | 是 | 仅四周稀疏碎金，中央留空 |

后台单个红包的 `prizediy` 自定义正反面素材继续通过行内 `background-image` 覆盖主题默认图，优先级不变。
