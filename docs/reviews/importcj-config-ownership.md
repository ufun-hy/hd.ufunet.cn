# 导入抽奖配置归属与后台整理

日期：2026-10-19。范围：现有风格 1～6 的后台配置整理；数据跳动风格 7 仍处于接入规划阶段。

## 调整结果

活动后台与系统默认配置统一为以下顺序：

1. 基础与数据：页面标题、背景、字段及隐私设置。字段字号比例保留在字段行内，明确标注为“结果/记录字号”，避免字段增删后错配。
2. 抽奖风格与过程：风格选项及当前风格真正适用的参数。
3. 结果与记录：卡片主题、主字段和附加字段，所有现有风格共用。
4. 音效与启动过渡：背景音乐、抽奖音效、揭晓音效和启动视频。
5. 旧版兼容设置：默认折叠，保留旧字段值，明确当前结果卡片和控制台不使用这些设置。

系统默认配置原先未引入已有的 `importcjresultconfig.html`，现在与活动后台共用。没有更改字段名、保存接口、抽奖控制器或大屏渲染代码。

## 配置归属表

以下未特别标注的键属于 `styleconfig`。

| 参数 | 实际读取位置 / 作用 | 当前适用范围 | 后台处理 |
| --- | --- | --- | --- |
| 顶层 `title/bgtype/bgimg/bgvideo` | 公共页面标题和舞台背景 | 全部 | 基础与数据 |
| 顶层 `prizeimg` | 系统默认新增奖品图片 | 系统配置入口 | 保留原入口 |
| `fieldname[]/fieldsecret[]/lefthand[]/righthand[]` → fieldconfig | `screenimportcj.js:initonedata`，候选和结果隐私处理 | 全部 | 数据字段 |
| `fieldcolor[]` → fieldconfig.fieldcolor | 大屏模板旧滚动/3D字段、弹幕字段、专用结果和记录字段 | 多种展示共用；星环运行态有自己的配色 | 数据字段；避免误称只用于结果 |
| `resultfieldscale1～4` | `screenimportcj-result.js:selectFields` 和 typography；记录页也使用该描述 | 全部风格的结果与记录 | 保留字段行位置，列名明确作用范围 |
| `flytype` | 控制器初始化/运行/停止分支 | 全部 | 风格选择 |
| `rolltxt1～5` | `app/screen/view/importcj/index.html` 中旧列表字号 | 风格1运行态可见；新结果不读取 | 仅随机滚动显示，删除“以及中奖列表”描述 |
| `margin/padding/over8linenum` | 同上，旧列表间距和每行个数 | 风格1运行态可见 | 仅随机滚动显示 |
| `maxrollnum` | `startLottery:initrollitem(min(onceout,maxrollnum))`；`changerollitem` 和 `stopOnerollitem` 使用旧列表计时 | 1；5/6沿用历史逐个停止时也影响次数 | 1/5/6显示，说明兼容影响；未修改停止行为 |
| `flyonesize/flyonespeed` | 大屏模板字号；控制器 flytype=2 的飞出速度 | 2 | 仅2显示 |
| `flygridsize/flygridspeed` | 大屏模板字号；控制器 flytype=3 的速度 | 3 | 仅3显示 |
| `flysphereballw/flyspherecell` | `screenimportcj.js:sceneInit` | 4 | 仅4显示 |
| `flyspheresize/flyspheretype/flyspherespeed` | 大屏模板字号；控制器旋转方式和速度 | 4 | 仅4显示 |
| 星环运行态 | `screenimportcj-halo.js` 内部排布、样式和动画 | 5 | 说明自动适配，不凭空增加未接入的参数 |
| `danmakusize/danmakudensity` | `getDanmakuStyleConfig` → 弹幕舞台 | 6 | 仅6显示 |
| `danmakucolormode/danmakucolor` | 弹幕强调色及随机配色 | 6 | 仅6显示，固定色才显示颜色选择 |
| `danmakubox/danmakuavatar/danmakuextra` | 弹幕背景边框、首字头像、附加字段 | 6 | 仅6显示 |
| 弹幕速度预设 | 大屏控制坞与 localStorage，未存入后台 styleconfig | 6 | 不新增重复后台入口 |
| `color` | `mountUnifiedPrize:setAccent`；旧模板也有默认文字色引用 | 1～5准备页；6跳过 setAccent；旧字段文字通常有 fieldcolor 覆盖 | 改名“准备页强调色”，1～5显示，不再宣称控制结果文字 |
| `resultcardmode/resultcardcolor` | ResultView 的 applyCardBackground；记录抽屉同样调用 | 全部结果与记录 | 独立共用面板，custom 时显示颜色 |
| `resultmainfield/resultextra1～3` | ResultView.selectFields，记录页复用 | 全部结果与记录 | 独立共用面板 |
| 顶层 `bgmusicoff/bgmusic/iscjingmusic/iscjendmusic` | 公共音乐和控制器开始/停止音效 | 全部 | 音效与启动过渡 |
| `hidevideo` | 大屏模板生成 firevideo1，控制器等待 ended 再启动动画 | 全部 | 音效与启动过渡，保留有效设置 |
| `awardsize/prizesize/topbg` | 旧 importcj-header；当前统一舞台隐藏它 | 旧页面 | 旧版兼容设置 |
| `prizebg` | 旧 importcj-awardlist 内奖品装饰；当前统一奖品展示隐藏旧区 | 旧页面 | 旧版兼容设置 |
| `bottombg/btn/showstopbtn/listname` | 旧 importcj-footer 背景、按钮、开关、记录别名；当前统一控制坞另有实现 | 旧页面 | 旧版兼容设置，停止按钮说明更新 |
| 顶层 `autoscroll` 与 `autoscrollspeed` | 旧长列表滚动；当前 dedicatedResult 分支不启动它 | 旧结果列表 | 移至旧版兼容设置；值仍保留 |
| `baozhavideo` | firevideo2；当前 dedicatedResult 分支主动隐藏并暂停 | 旧结果展示 | 旧版兼容设置 |
| 奖品级 `stoptype` | `changerollitem/stopOnerollitem` | 后台仅风格1普通抽奖可配置；5/6控制器仍可能消费遗留值 | 本次保留奖品编辑入口和控制器行为 |
| 轮次 style 中的 rows/awardcolor/awardsize/namesize | `stopLottery` 的非 dedicatedResult 分支 | 旧轮次结果 | 不属于本次基本设置表单；未修改轮次编辑器 |

## 保存与兼容约束

- 切换风格只调整面板的 hidden class，不 disable、删除或清空任何输入，不为相同字段创建另一份输入。
- 风格面板采用 `data-importcj-styles` 明确适用列表；初始服务端条件与前端切换使用相同列表。
- 风格取值通过字段名定位，不再依赖选择区域的 `.parent().next()` DOM 顺序。
- 无论旧版兼容区是否展开，所有原输入仍由现有 `webcore.serializeObject` / jQuery serializeArray 提交。
- 字段颜色和字号比例继续跟随原字段行增删、重排，不复制到第二张表。
- 本次没有增加风格7选项；待其实际实现后再声明适用参数。

## 验证证据与边界

- 本地浏览器使用两个真实入口模板、六种初始风格，共12组；通过实际内联切换逻辑和现有序列化函数检查显示范围、反复切换、编辑值保留、折叠参数提交、颜色联动和键盘选择。
- 活动入口模拟表单有63个提交键，系统入口69个；切换时除 flytype 外所有序列化值保持一致。
- 静态展开新旧表单对照：原输入未删除；系统入口只补充已有结果配置的输入。
- 本地没有 PHP 运行环境。预览以小型测试渲染器提供模拟字段与上传控件，不能证明 ThinkPHP 编译、实际上传控件或服务端保存/回读成功。
- 没有保存真实活动、调用业务接口或部署。

## 实际环境验收

分别在活动后台和系统默认配置入口保存一次测试配置并刷新，确认球体/弹幕/结果配置和旧兼容值回读正确；再切换风格保存、切回验证原值。检查文件选择器和表单校验正常。实际服务器模板编译与保存回读通过后，才可视为完整环境验收完成。
