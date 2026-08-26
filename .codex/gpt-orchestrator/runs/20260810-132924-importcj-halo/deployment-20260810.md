# 导入名单星环抽奖部署记录

- 主部署时间：2026-08-10 14:34（Asia/Shanghai）
- 主部署标识：`importcj-halo-20260810-143345`
- 缩放修正时间：2026-08-10 14:45（Asia/Shanghai）
- 缩放修正标识：`importcj-halo-scale-fix-20260810-144429`
- 目标主机：SSH 别名 `ufunhd`
- 项目目录：`/www/wwwroot/hd.ufunet.cn`
- 主备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/importcj-halo-20260810-143345`
- 修正备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/importcj-halo-scale-fix-20260810-144429`

## 最终部署文件

| 文件 | SHA-256 |
| --- | --- |
| `app/common/tpl/web/themes/default/common/importcjstyle.html` | `621ee4581000c76c43b3ffccfd05a179320a045d320e65cb424777f84413dac7` |
| `app/screen/view/importcj/index.html` | `8267037576b852c12e801cd688b92706ec69c2d4d427473c05fc0d135ad0035d` |
| `public/static/js/screenjs/screenimportcj.js` | `1e50e43996f9d9ff83b923ae111983dd001d4c4a462773cd7fa5f5c8310c7e41` |
| `public/static/js/screenjs/screenimportcj-halo.js` | `81dbb5686aca2b5bde53d80aae09811c2a9189f7b7aa7fefb2b84b44b8daa87c` |
| `public/static/css/screencss/screenimportcj-halo.css` | `d342d49730dd586f742be9dffaab2c945eaf41d2a854f36005a45bd983d4f772` |

## 发布安全措施

- 发布前确认 3 个既有线上文件与仓库 `HEAD` 的 SHA-256 完全一致；2 个星环资源原先不存在。
- 先上传到独立暂存目录，校验哈希后再安装到站点目录。
- 主部署备份了 3 个被覆盖文件；缩放修正又单独备份了首版星环模块。
- 两轮发布命令均带精确目标回滚，不包含目录同步或 `--delete`。
- 未修改数据库、活动菜单、奖品、名单、中奖记录或广告配置。

## 线上验证

- 公网回读 3 个静态资源均为 HTTP 200，返回 SHA-256 与服务器和本地一致。
- 真实导入抽奖 iframe 已通过生产 RequireJS 加载 `screenimportcj` 与 `screenjs/screenimportcj-halo`。
- 首轮试装发现框架外层缩放导致 `getBoundingClientRect()` 二次放大；修正为使用根节点 `clientWidth/clientHeight` 后重新部署。
- 修正后真实根布局为 `1411×800`，渲染区域为 `2316×1313`；星环计算比例为 `0.7349`，最终舞台为约 `2315.88×1302.68`，与可用大屏吻合。
- 浏览器临时试装生成 1 个星环舞台和 60 个外围节点；中央完整姓名正常变化。
- 验证未调用 `/screen/importcj/savelucker`，结束后舞台节点为 0，页面已恢复原主题类。
- 线上截图：`test-results/production-importcj-halo-scale-fixed.png`。

## 尚需人工确认

当前活动仍保存为普通名单抽奖，且自动化浏览器中的后台登录态已过期。需要用户登录后台，在“导入名单抽奖 → 风格设置”选择“星环名单抽奖”并保存，然后回读确认加密后端是否保留 `flytype=5`。

## Gemini 彩色球体与多轨动画升级

- 部署时间：2026-08-10 15:21（Asia/Shanghai）
- 部署标识：`importcj-halo-gemini-motion-20260810-152051`
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/importcj-halo-gemini-motion-20260810-152051`
- Gemini 模型：`Gemini 3.1 Pro (High)`，通过 `agy-desginer revise` 分别生成 CSS 和 JavaScript 完整候选。
- CSS 候选完整采用；JavaScript 候选仅修正一个可能产生双负号 CSS 延迟的负角度归一化缺陷，其余视觉实现保留。
- 最终 CSS SHA-256：`83412cf82fb993f8ebf1c2c0698503553ed9661b56a93497a5c8a3b8e5b89e36`。
- 最终 JavaScript SHA-256：`ca278d3d3abbeb4f76db2ace389937f1b59f967b83665504e1cd46b28e30893c`。
- 外围球体改为高光、彩色内核、暗边、体积阴影与多层景深；6 组色相均匀分布。
- 60 个节点分为 4 个半径、尺寸、速度和模糊层次；30 个节点反向运动，使用 4 组缓动；候选换人采用小批次与偶发脉冲交替。
- 本地 1920×1080 实测约 `60.16 FPS`；重复启动后仍为 1 个舞台和 60 个节点，停止后节点、定时器与 resize 监听全部清空。
- 1366×768 舞台缩放为 `0.7111`，渲染尺寸约 `1365.31×767.99`，背景透明。
- 线上真实框架中舞台缩放为 `0.7349`，60 个节点、30 个反向节点、6 组颜色均正常；验证没有 `/screen/importcj/savelucker` 请求，结束后恢复原主题类并清空临时节点。
- 线上截图：`test-results/production-gemini-layered-motion.png`。

## 扫码头像演示稿精确回归

- 部署时间：2026-08-10 15:51（Asia/Shanghai）
- 部署标识：`importcj-halo-demo-exact-20260810-155057`
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/importcj-halo-demo-exact-20260810-155057`
- 唯一视觉基准：`marketing/taobao-mainimage-v4-product-screen-20260805/demos/gemini-lottery-effects-v2.html` 的“扫码头像 → 星际环绕”。
- 撤销上一版额外设计：四层规则轨道、反向运动、玻璃高光、爆发脉冲和非线性缓动均已移除。
- 恢复演示稿参数：60 个外围头像，`40–90px` 尺寸、`200–950px` 半径、`0.3–1.8` 景深缩放、`20–50s` 线性公转、`0.15–0.65` 随机透明度、`brightness(0.8) contrast(1.2)` 与六组双色渐变。
- 中央圆球沿用同组六组渐变；仅为导入名单业务保留“显示首字段完整姓名”，外围头像保留首字/缩写，并每 900ms 小批量换人。
- 最终 CSS SHA-256：`fb54b1985642ebc823cd4168950e848d81b258c40b8fd1ff1c2fd7ecda1eaa57`。
- 最终 JavaScript SHA-256：`291c799910317a843699e660a800542560c0e70f9c44004fb9601283a8b6ffd2`。
- 公网两项资源均返回 HTTP 200 且哈希与本地一致。
- 本地 1920×1080 同机连续 3 秒测得演示稿与实现版均约 `36.3 FPS`；实现没有引入相对演示稿的额外帧率损失。
- 1366×768 下舞台缩放为 `0.7111`，重复启动仍只有 1 个舞台与 60 个节点，停止后全部清理。
- 线上真实框架探针：根布局 `1521×800`、外部渲染约 `2300×1210`、舞台内部缩放 `0.7407`；六组颜色、60 个节点、随机透明度和透明背景均通过。
- 探针前后 `/screen/importcj/savelucker` 请求数均为 0；清理后恢复原 `flybox1`，星环节点为 0。
- 对照截图：`test-results/reference-demo-orbit.png`、`test-results/implementation-demo-exact.png`、`test-results/production-demo-exact.png`。

## 外围圆球完整姓名修复

- 部署时间：2026-08-10 16:07（Asia/Shanghai）
- 部署标识：`importcj-halo-full-names-20260810-160704`
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/importcj-halo-full-names-20260810-160704`
- 根因：`initialsFor()` 对中文值只返回第一个汉字，导致背景圆球永远只有一个字符。
- 修复：外围圆球改为显示完整首字段文本；按圆球尺寸和文本长度动态计算字号，自动换行并限制在圆形内部。
- 保持不变：60 个节点、演示稿六组渐变、随机透明度、景深缩放、公转速度、900ms 批量换人和原背景/结果态。
- 最终 CSS SHA-256：`77e47c6284ee7c474257fddff386eb0a9aaa016cd06127693d1a6b57bbaf64c1`。
- 最终 JavaScript SHA-256：`30b8d79654c3f453d127af29242ee1fb5add111a85f30c84ecb5c8f046582922`。
- 公网 CSS/JS 均 HTTP 200，回读哈希与本地一致。
- 本地验证覆盖中文短姓名、复姓、英文姓名和超长姓名；线上探针验证 60/60 个外围节点均为多字符文本，字号变量正常生成。
- 线上真实框架探针根布局缩放 `0.7406`，舞台背景保持透明；清理后恢复 `flybox1`、节点数为 0，`/screen/importcj/savelucker` 请求数为 0。
- 对照截图：`test-results/halo-fullnames-local.png`、`test-results/production-full-names.png`。

## 圆球文字边缘缓冲修复

- 部署时间：2026-08-10 16:27（Asia/Shanghai）
- 部署标识：`importcj-halo-text-buffer-20260810-162748`
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/importcj-halo-text-buffer-20260810-162748`
- 修复：圆球文字内边距按节点尺寸动态取 `5–12px`，字号计算同步扣除边框和内边距，文字与圆形边缘保持安全缓冲。
- 保持不变：颜色、透明度、景深、轨道、公转速度、换人节奏、背景和结果态均未修改。
- 最终 CSS SHA-256：`5f0728d24d33d7d946c9ce7a825eaef7ead669c5f30c8c6d0fd2bbfc65bf80d4`。
- 最终 JavaScript SHA-256：`dcd4309c00e694f392c90729530112dcff65b95b142c5d9328e7b16a1dfcc706`。
- 公网 CSS/JS 均 HTTP 200，回读哈希与本地一致。
- 本地和线上均验证完整中文姓名、复姓、英文姓名及超长姓名；线上缩放 `0.7406`，背景透明，60/60 节点保留内边距变量。
- 清理后恢复 `flybox1`，星环节点为 0，`/screen/importcj/savelucker` 请求数为 0。
- 对照截图：`test-results/halo-text-buffer-local.png`、`test-results/production-text-buffer.png`。

## 管理后台星环风格示例图替换

- 部署时间：2026-08-10 16:47（Asia/Shanghai）
- 部署标识：`importcj-style-preview-20260810-164729`
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/importcj-style-preview-20260810-164729`
- 管理后台模板 `importcjstyle.html` 的“星环名单抽奖”卡片已改为真实图片引用：`/static/images/sys/style/importcj/5.jpg`。
- 用户提供的 1920×1080 截图已按后台风格卡片比例生成 360×202 JPEG，文件大小约 31KB，适合后台列表加载。
- 模板 SHA-256：`0c61e5109d3784f4a55a90c72728486159e6b5b770fc4022674a159f9f422bee`。
- 预览图 SHA-256：`ef5f71b452857c98cead316ce892b14500995a3a6647cfef053daa225cffb154`。
- 服务器模板、图片均通过精确哈希安装；公开图片地址 HTTP 200，浏览器回读尺寸 `360×202`。
- 未修改风格选择保存逻辑、抽奖运行态或任何活动配置。当前后台登录态过期，未进行页面点击或保存操作。
- 对照截图：`test-results/admin-style-preview-public.png`。
