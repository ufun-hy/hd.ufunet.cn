# 星环头像抽奖部署记录

- 部署时间：2026-08-05 18:14（Asia/Shanghai）
- 部署标识：`lottery-halo-20260805-181417`
- 目标主机：SSH 别名 `ufunhd`
- 项目目录：`/www/wwwroot/hd.ufunet.cn`
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-20260805-181417`
- 服务器暂存目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-staging/lottery-halo-20260805-181417`

## 部署文件

| 文件 | SHA-256 | 权限 |
| --- | --- | --- |
| `app/screen/view/lottery/index.html` | `7cf7e649a441d3dbd79d674c7bcc414353311397567c1ade196089548397eac0` | `www:www 755` |
| `public/static/css/screencss/screenlottery-halo.css` | `681db6157bde91a16b2aa4975a34af2e26bc9eb9888deffef4c574d9d8c5d77d` | `www:www 644` |

## 安全措施

- 发布前校验线上模板 SHA-256 仍为 `7fe81e13564f6b8a6115066704428dc47488cc3ce2df6917a65e44a173bce65e`。
- 线上模板与本次版本仅有 9 行主题入口新增。
- 先备份、先发布 CSS，再原子替换模板；部署命令包含错误回滚。
- 未修改数据库、后台风格记录、加密 controller/service 或 `screenlottery.js`。

## 外部验证

- URL：`https://hd.ufunet.cn/static/css/screencss/screenlottery-halo.css`
- HTTP：`200 text/css`
- 下载大小：10352 bytes
- 公网返回 SHA-256：`681db6157bde91a16b2aa4975a34af2e26bc9eb9888deffef4c574d9d8c5d77d`，与服务器文件一致。

## 真实大屏布局修正

- 修正时间：2026-08-05 18:40（Asia/Shanghai）
- 修正标识：`lottery-halo-layout-fix-20260805-184032`
- 修正范围：仅更新 `public/static/css/screencss/screenlottery-halo.css`，未再次修改模板、JavaScript、数据库或活动数据。
- 修正原因：真实大屏使用 CSS `zoom`，原方案又保留了旧 `.wall3d` 球体，并将 6 个参与者同时放大，导致线上出现重叠的大球体与头像阵列。
- 修正结果：隐藏旧 `.wall3d`，将第一个动态参与者设为中央主头像，其余参与者作为外围弱化头像；星环动画保留居中位移，兼容 1920×1080、1366×768 与 1024×576。
- 当前 CSS SHA-256：`ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56`。
- 回滚文件：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-layout-fix-20260805-184032/screenlottery-halo.css.before`，SHA-256 为 `681db6157bde91a16b2aa4975a34af2e26bc9eb9888deffef4c574d9d8c5d77d`。

### 修正后线上验证

- 用户提供的真实活动链接已在 1920×1080 运行态复验。
- 线上主题类：`main-box lottery-halo-theme`。
- 新样式表加载 64 条规则，页面不存在临时注入样式。
- 抽奖运行时共 6 个动态参与者，中央主头像与 5 个外围头像正常显示，旧 `.wall3d` 为 `hidden`。
- 文档和 body 尺寸均为 1920×1080，无横向或纵向溢出。
- 只触发“开始抽奖”验证动画，没有触发“停止抽奖”，因此没有写入中奖数据。
- 截图：`test-results/live-production-fixed-running-verified.png`。

## 抽奖前与结果态统一升级

- 部署时间：2026-08-06 17:42（Asia/Shanghai）
- 部署标识：`lottery-halo-idle-result-20260806-174232`
- 发布范围：仅更新 `public/static/css/screencss/screenlottery-halo.css`。
- 新 CSS SHA-256：`ca5b56e1c121602af4bdee583a6529edadf4d3146c558b139b9c49a308fd6521`。
- 备份文件：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-idle-result-20260806-174232/screenlottery-halo.css.before`。
- 备份 SHA-256：`ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56`。
- 公网回读：HTTP 200，46256 bytes，SHA-256 与本地和服务器一致。
- 活动 `qcbz4sQ6ZSCSbnBW4wDgb5G6krs5bspu` 的抽奖风格由“橙色风格”（ID 6）切换为“星环头像抽奖”（ID 8），以便直接验收。
- 真实页面验证：主题类为 `main-box lottery-halo-theme`，加载线上 CSS 169 条规则，无临时注入样式，背景正常显示，页面无滚动溢出。
- 未修改抽奖 JavaScript、奖品、名单或中奖数据。

## 仅保留抽奖中星环效果

- 部署时间：2026-08-06 18:14（Asia/Shanghai）
- 部署标识：`lottery-halo-running-only-20260806-181333`
- 用户要求：开奖前和开奖结果恢复上一版效果，仅修改抽奖进行中的星环动画。
- CSS SHA-256：`e40fb6c019f548144f13338e8f7b6ff4eac7e96e5e1244caa18ee089370143fd`。
- JavaScript SHA-256：`4c52a3f1bfc4e938da5bb5105432815fadf92e9e87d41acfbedcf83364865bb6`。
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-running-only-20260806-181333`。
- CSS 的前 15898 字节与上一版 `ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56` 完全一致；新增后缀只包含 `.lottery-userBox` 运行态规则。
- 星环主题运行态固定生成“中央 1 个 + 环绕 15 个”视觉头像；非星环主题仍保持原有最多 12 个展示逻辑。
- `selnum` 仍原样提交给 `/screen/lottery/savelucker`，固定数量只作用于 `changeuser` 动画占位，不改变真实中奖人数。
- 线上模块验证：调用 `changeuser(1)` 与 `changeuser(8)` 均生成 16 个视觉头像；测试未调用保存接口。
- 1920×1080、1366×768、1024×576 下分别检查所有轨道头像的 0°、90°、180°、270°位置，均未越界。
- 真实页面验证：开奖前为上一版左右内容区；开奖结果为上一版 Flex 网格，结果项无星环绝对定位动画；页面无临时注入样式。

## 抽奖中密集头像对齐演示页

- 部署时间：2026-08-06 18:29（Asia/Shanghai）
- 部署标识：`lottery-halo-demo-density-20260806-182924`
- 用户要求：抽奖中的外围头像数量、大小错落和运行密度以 `gemini-lottery-effects-v2.html` 的“星际环绕”演示为准；开奖前和开奖后继续保持上一版。
- CSS SHA-256：`3683d656b3b7af855d09c013fa8fb32c77d4b2f6fd4a3feb1ef3b2dbbbd60e34`。
- JavaScript SHA-256：`45b276e89c922405444cb8e9b7c0464badacc501b96f8cfc484f3611b9ba4fe1`。
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-demo-density-20260806-182924`。
- CSS 的前 15898 字节仍与恢复版 `ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56` 完全一致，证明开奖前和开奖后规则未改。
- 星环主题运行态固定生成“中央 1 个 + 外围 60 个”视觉头像；外围头像数量与中奖人数无关。
- 外围参数按演示页范围动态生成：尺寸基准 `3.7–8.3vh`、缩放 `0.3–1.8`、半径 `18.5–88vh`、时长 `20–50s`、随机负延迟 `0–50s`，运行时透明度统一为 `0.8` 并增强亮度与光晕。
- 外围头像开始时填充一次并持续公转；只有中央头像以 60ms 间隔切换，避免 60 个远程头像每 100ms 同时刷新造成额外负载。
- `selnum` 仍原样提交给 `/screen/lottery/savelucker`，61 个节点只影响运行态画面。
- 线上安全验证：调用 `changeuser(1)` 与 `changeuser(8)` 均生成 61 个视觉头像；临时切换为非星环主题调用 `changeuser(20)` 仍生成 12 个；浏览器资源记录中没有 `/screen/lottery/savelucker` 请求。
- 1366×768 实测外围 60 个，当前动画帧约 50 个与视口相交；中心头像持续切换，外围首个头像保持稳定，符合演示页“中心滚动 + 外围公转”逻辑。
- 公网回读 CSS、JavaScript 均为 HTTP 200，SHA-256 与本地和服务器文件一致。

## 抽奖中完全采用 Gemini 演示原值

- 部署时间：2026-08-06 18:49（Asia/Shanghai）
- 部署标识：`lottery-halo-exact-gemini-20260806-184924`
- 用户反馈：上一版将尺寸与半径转换为 `vh`，并保留小屏缩小规则，导致头像大小、中心比例和景深与 Gemini 演示不一致。
- 本次 CSS 与 Gemini `revise` 完整候选文件逐字一致；JavaScript 除 CRLF 行尾外与 Gemini 完整候选内容一致。
- CSS SHA-256：`b10d9c295dd3bebf564812aabf1cc869404c7ebcb937053f0edc8c4473247061`。
- JavaScript SHA-256：`e1953563002fed17e68a41ecc589a2ebe47c6d9af1242f858809010b55060649`。
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-exact-gemini-20260806-184924`。
- CSS 的前 15898 字节继续保持 `ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56`，开奖前和开奖结果规则未变。
- 外围头像完全恢复演示源码原值：`40–90px`、`0.3–1.8` 缩放、`200–950px` 半径、`20–50s` 时长、`0 到 -50s` 延迟、运行态 `0.8` 透明度。
- 中心运行态完全恢复演示源码原值：头像 `240px` 并 `scale(1.08)`；三条环 `350/450/550px`，转速 `2/3/4s`；抽奖中隐藏中央昵称。
- 删除了运行态在 1366×768 等小屏下缩成 `190px` 中心头像和 `300/400/500px` 三环的覆盖规则。
- 线上 1366×768 验证：61 个视觉节点，外围实际渲染约 `15–149px`，中心 CSS 宽度 `239.99px`、变换矩阵 `1.08`，三环精确为 `350/450/550px`。
- 中心头像持续切换、外围头像保持稳定公转；浏览器未记录 `/screen/lottery/savelucker` 请求。
- 公网回读 CSS、JavaScript 均为 HTTP 200，SHA-256 与本地和服务器文件一致。

## 1920×1080 内部舞台对齐 Gemini 演示

- 部署时间：2026-08-07 15:41（Asia/Shanghai）
- 部署标识：`lottery-halo-1920-stage-20260807-154143`
- 用户反馈：线上抽奖中虽然使用了 Gemini 原始像素值，但真实系统会先把 800px 高的 `.full-main` 放大到窗口高度；演示页则把 1920×1080 整体等比缩放，导致线上头像、星环和环绕半径被额外放大，画面密度与景深不一致。
- 本次修正：将 `.lottery-userBox-wrapper` 固定为 1920×1080 内部舞台，再按容器 `min(width / 1920, height / 1080)` 整体缩放；中心头像、三层星环和全部外围头像由同一坐标系缩放。
- 舞台边缘使用 `overflow: hidden`，与演示页的 16:9 裁切一致；同时隐藏复用星环元素遗留的旧角标伪元素。
- 保持演示原值：中心头像 `240px × 1.08`、星环 `350/450/550px`、外围头像 `40–90px`、缩放 `0.3–1.8`、半径 `200–950px`、60 个外围头像。
- CSS SHA-256：`c83d7f46a3e6b00dfdbb516e22b8ffef66acdbf4772148f9e985adb5d6edc1e2`。
- JavaScript SHA-256：`f0ca281a3c07453527b48828dda9cc8bcc6edbe2f3e155496a5bae65397b78f0`。
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-1920-stage-20260807-154143`。
- CSS 前 15898 字节继续保持 `ff2fe744ce24fd6c88d0c1642f96c1f809820b10e65ffea4182f3294dc2c5a56`，开奖前与开奖结果规则未变。
- 发布前线上文件 SHA-256 与上一版记录一致；CSS 与 JavaScript 经暂存校验、备份和原子替换发布，权限保持 `www:www 644`。
- 公网回读 CSS、JavaScript 均与本地及服务器 SHA-256 一致。
- 线上 1366×768 安全验证：舞台 CSS 尺寸约 1920×1080、缩放值 `0.74`、三环为 `350/450/550px`、61 个视觉节点（中心 1 + 外围 60）；`changeuser(8)` 仍为 61 个，临时切换非星环主题后 `changeuser(20)` 为 12 个。
- 中心头像在 60ms 间隔内发生变化，外围首个头像源保持不变；测试只直接调用 `changeuser`，浏览器资源记录中没有 `/screen/lottery/savelucker` 请求。

## 动态候选头像与多人结果完整滚动

- 部署时间：2026-08-07 16:34（Asia/Shanghai）
- 部署标识：`lottery-halo-dynamic-pool-20260807-163459`
- 用户反馈：外围头像仍被强制为 `0.8` 透明度和 `1.4` 亮度；外围头像固定不换，容易被理解成仅从画面中的固定人员抽取；中奖人数较多时，结果列表前几行无法显示。
- CSS 采用 Gemini 完整候选：外围节点恢复读取 `--opacity` 的 `0.15–0.65` 随机值，头像亮度改为 `0.8`，增加 `0.3s` 换人过渡；中奖列表的 `align-content` 从 `center` 改为 `flex-start`。
- JavaScript 在现有中心头像计时器中按真实经过时间控制外围候选池：约每 900ms 随机分批替换 3 个外围头像，保持 60 个轨道节点、位置、大小、半径与动画连续；停止抽奖时仍由原有 `changeTimer` 统一清理。
- CSS SHA-256：`1fa7e5b7a88ad9c3dbdbd81459364b399dfc658b2130d7c4023d4b4f2aa2e3e1`。
- JavaScript SHA-256：`c26ffd6a86b596906d9c24cfd57f28cc697059d216fa678274bc9daed7485e3a`。
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-dynamic-pool-20260807-163459`。
- 公网回读 CSS、JavaScript 均与本地及服务器 SHA-256 一致，线上样式表共 90 条规则，无临时注入样式。
- 线上安全验证：61 个星环视觉节点，随机透明度实测约 `0.16–0.61`，计算亮度为 `0.8`；3.2 秒内 9 个外围节点头像源发生变化，中心头像继续变化，换人过渡类正在分批出现。
- 80 人结果列表验证：顶部可见第 1 人，滚动到底可见第 80 人；原问题中因居中对齐被挤到滚动区域上方的前几行已恢复。
- 星环主题 `changeuser(8)` 仍为 61 个视觉节点，非星环主题 `changeuser(20)` 仍为 12 个；整个验证过程没有 `/screen/lottery/savelucker` 请求。

## 星环主题继承橙色风格静态素材

- 部署时间：2026-08-07 17:12（Asia/Shanghai）
- 部署标识：`lottery-halo-orange-assets-20260807-171234`
- 星环头像抽奖（ID 8）的 17 个静态素材字段从橙色风格（ID 6）同名字段继承；主题名、状态、排序和自定义 CSS 未修改。
- 已去除星环 CSS 对左右底板、奖品底纹、开始/停止/关闭按钮、结果头像边框和名单底纹的强制遮挡；按钮伪元素文字已关闭，避免与橙色图片内容重叠。
- 抽奖中的 1920×1080 星环舞台、60 个外围节点、透明度、亮度、头像轮换和结果人数适配逻辑未修改。
- CSS SHA-256：`b2236ffa92308f83447796574948e7794740eb9c68d4fc65fffea33b3e5ee40a`。
- 数据迁移 SHA-256：`af86521261843f1615e76c4724e980b44da0ccdf24b22cf42a44586840925a14`。
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-orange-assets-20260807-171234`，包含部署前 CSS 和权限为 0600 的两条主题记录快照。
- 11 个橙色自定义素材在实际媒体域名均返回 HTTP 200；公网回读 CSS SHA-256 与本地和服务器一致。
- 部署后发现当前活动配置已被外部切回橙色风格（`mibov3_huodong_configlottery.styleid = 6`）；本次未覆盖该现有活动选择。当前链接可验证橙色素材本身，选回“星环头像抽奖”后才能联合验证星环动画。

## 清理旧主题缓存并去除透明黑层

- 部署时间：2026-08-07 17:26（Asia/Shanghai）
- 部署标识：`lottery-halo-cache-mask-fix-20260807-172624`
- 用户复现：活动切回“星环头像抽奖”后，页面仍使用 `left.png` / `right.png` / `start.png` 等默认素材，结果页还有大面积半透明黑色层。
- 根因：Redis `xcv3:gamestyle:lottery` 中 ID 8 仍是修改前的默认素材快照，且剩余约 5 天有效期；页面优先读取了该缓存，因此未使用数据库中已经正确的橙色素材。
- 精确备份并删除了 `xcv3:gamestyle:lottery` 一条缓存，未清理其他活动或业务缓存。页面重载后缓存已从数据库重建，ID 8 回读为橙色左右底板、开始按钮和头像边框。
- 关闭了 `.main-box::before` 噪点混合层；将 `.lottery-userBox` 运行层和 `.lottery-luckers` 结果层的背景设为完全透明，并去除结果层的背景模糊。
- CSS SHA-256：`dbbe073e94260b94b5a3996bc62083c1945899f57c8e227772591365c3a9daf6`。
- 模板 SHA-256：`f12c5195f8a0c68a47c58849a13542fd5b93f8e27f090ee816afee2d76af9b27`；星环样式表链接增加 `v=202608071726` 版本参数，避免用户浏览器继续命中修复前 CSS。
- 备份目录：`/www/wwwroot/hd.ufunet.cn/runtime/deploy-backups/lottery-halo-cache-mask-fix-20260807-172624`，包含部署前 CSS、原缓存值和原 TTL，缓存备份权限为 0600。
- 公网回读 CSS SHA-256 与本地和服务器一致。强制禁用浏览器缓存后复验：橙色左/右底板、奖品底纹、开始/停止按钮 URL 均正确；噪点层为 `display:none`，运行层和结果层背景均为全透明。
