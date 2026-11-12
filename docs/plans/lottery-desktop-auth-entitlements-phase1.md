# 有范抽奖客户端第一阶段：用户、认证与产品权益实现方案

评估日期：2026-09-21。目标仓库：`ufun-hy/hd.ufunet.cn`。本地评估基线：`main @ 9d501c84865008b327629163858747bd5ffe8586`，读取前工作区干净。

本文是方案，不是实现完成报告。只新增本文；未修改业务代码、执行 migration、访问生产数据库、读取账号密钥、调用支付或发送短信。当前任务工作目录为 GEO-ufun，实际核查的是同级目标仓库 hd.ufunet.cn。结论不等同于生产环境行为认证。

**建议：同一 User 身份 + 独立 Desktop Token + 独立 Product Entitlement + 非对称签名的离线 License。** Web 会话、旧活动计费和现有支付渠道保留。Desktop 只接收稳定的用户摘要、能力和授权，不认识旧用户组编号、模块 ID 或活动人数价格。

关键默认值是建议政策，尚不是既有业务事实：Access Token 10 分钟；Refresh Token 30 天闲置、90 天绝对期限；离线授权默认 15 天；已经有效进入现场的单场活动最多续场 24 小时。Basic 也包含离线与双屏，Pro 增加主题和品牌能力，AI 为在线附加权益。价格、赠送范围不在本轮替业务方决定。

## 1. Current State：证据与未知项

### 1.1 框架及可核查边界

项目是 Webman，不是 ThinkPHP 应用；使用 Think ORM 与 Think Template。`composer.json` 声明 PHP >=7.2、Webman ^1.5、`yansongda/pay 2.10.5`、`overtrue/wechat ~4.0`、Redis 等依赖。这是仓库依赖声明，不是运行时版本检测。

以下指定核心文件均含 `sg_load()`，不能阅读实际业务实现：

- `app/common/model/web/User.php`、`UserGroup.php`。
- `app/common/service/web/userService.php`、`usergroupService.php`。
- `app/web/controller/login.php`、`loginreg.php`、`authlogin.php`。
- `app/middleware/WebCheck.php`、`MyhomeCheck.php`、`MyhdCheck.php`。
- `app/common/model/common/Sysorder.php`、`HuodongOrder.php` 及对应退款模型。
- `app/common/service/common/orderService.php`、`wxpayService.php`、`alipayService.php`、`smsService.php`。
- `app/common/controller/notify.php`，myhome 相关控制器，`app/common/validate/User.php`、`app/functions.php`。

全局 `RequestLog`、`RedisLog`、`GlobalCheck` 也加密。新增 API 即使不挂 WebCheck，仍可能先经过全局日志和鉴权，不能认为新建路由自然完成隔离。

仓库 `database/migrations/` 只有评分字段和主题资产变更，没有用户/订单建表 SQL；检查的 runtime 中也未发现 schema 缓存。本轮没有获知真实数据库 DDL。因此**当前 User 主表的物理表名、字段类型、默认值、NULL、唯一索引、外键、软删除方式均未确认**。示例 ORM 配置前缀为 `mibov3_`，不代表已确认生产表名是 `mibov3_user`。下文 User 指逻辑模型，不凭名称补造 DDL。

证据等级：**确认**＝直接可读代码或配置；**界面证据**＝模板有此字段/行为，尚未证明后端实现；**待核验**＝加密或缺少运行证据。附录列出具体位置。

### 1.2 User 核查结果
87082340
| 检查项 | 本轮能确认到的层次 | Desktop 处理建议 |
|---|---|---|
| 用户 ID | 管理列表用 `row.id`，个人中心用 `$user['id']`，后台订单显示 `row.user_id`；数据库类型未知 | 引用同一 User 主键；API 用字符串传输 ID，不重新编号 |
| 用户名 | `user_name`，编辑页写明唯一、4–16 字符；DB 唯一约束未知 | 展示及账号登录；大小写、空白、中文规范化必须与旧验证器一致 |
| 手机号 | `user_mobile`，页面写明一手机对应一用户，前端为大陆 11 位规则 | 手机验证码识别已有 User；V1 不擅自升级全球号码规范或自动注册 |
| 密码 | 管理输入字段 `user_password`；登录提交 `password`；修改提交旧密码 | 算法、盐、字段存储和比较方法全部未知，不能猜 MD5/bcrypt，也不能对现有 hash 再套新算法 |
| 状态 | 编辑模板：`1 正常 / 2 禁用 / 3 待审核` | 适配为 `active/disabled/pending`；后端真实判断、删除/锁定优先级待验证 |
| 账号有效期 | `loginlimittime`；个人页按 Unix 时间展示；管理页说明过期不能登录后台、活动提示账号过期，空值代表永久 | 暂定为账号级使用上限，不能被购买 Desktop 套餐隐式突破 |
| 免费截止时间 | `freeendtime`；说明是免费发布、增加功能/人数的截止日期 | 属于旧 Web 商业规则，不是 Desktop 产品期限 |
| 微信绑定 | `user_openid`；个人页称“绑定登录微信” | 不下发原始 OpenID，不把客户端提交的 OpenID 当登录凭据 |
| 微信登录调用 | 可读 `openwechat22.php` 调 `userService::openidtouser(FromUserName, sid)`，另有 `changeuseropenid` | 确认可读副本中有此调用；实际入口 `openwechat.php` 加密，不能确认此副本正在生产使用 |
| Session 存储 | 配置为 Redis、前缀 `xcv3:session:`、Cookie 名 `PHPSID`、默认 2 天 | 不复用其 Cookie、命名空间、Session ID |
| Session 内容 | 登录成功写哪些键、存 User 全量还是 ID、角色/分组快照、自动登录凭证，均未知 | 不可把模板 `$user` / `$admin` 变量说成 Session 键 |
| 客户端可读字段 | 可从现有字段派生 | 仅 `id, username, display_name, avatar_url, mobile_masked, account_state, account_expires_at` |

`display_name` 是 API 派生展示名，V1 可等于用户名，不宣称旧表已有此列。头像缺失/离线时用本地占位图。禁止原样序列化 User 模型：密码/盐、OpenID、实名、提现账户、内部备注、余额明细、角色权限、OEM 配置都不应随 `/me` 返回。

登录页有“7 天内自动登录”，但 session 配置默认 2 天；这是两个可观察事实，不能据此确定自动登录具体 Cookie、续期或覆盖逻辑。

### 1.3 现有登录入口

下表路径按模板 helper 和目录推定；helper 自身加密，部署前还需核对实际 URL、方法和请求处理。

| 登录方式 | 可读调用 | 可复用部分 | Desktop 差异 |
|---|---|---|---|
| 账号密码 | `goweb('login/index')`；`type=1, username, password, captcha, auto_remember` | 原用户身份、凭据验证规则、账号状态规则 | 新 JSON API；无 Session；独立防爆破/挑战；只复用无会话副作用的验证能力 |
| 手机验证码 | 同一登录入口 `type=2, mobile, mobilecode`；发送 `login/sendcode(mobile,yzm)` | 已有手机号绑定与短信通道 | 新 challenge/验证码作用域；必须服务端限流与一次性消费；不能共用 Web 验证码 Redis key |
| 微信扫码 | `login/makewxloginqr(type=1)`、`login/binduid(clientid)`；socket 事件 `wxloginsuccess`、`wxloginfirstmobile`；首次绑定 `fsendcode/flogin` | 已有公众号/微信账号关联语义 | 当前流程耦合 sid/socket/网页；另设计 Desktop 登录事务，不能复制 Web sid 或扫码 URL |

`loginreg/index.html` 有账号/手机/双方式/关闭、图形验证码、同账号禁止多地登录、微信开关等配置。Desktop 使用单独的认证会话，不应触发 Web 的“挤下线”。但是被运营关闭的身份验证通道不能悄悄被 Desktop 重新开放，需明确映射登录策略。

**V1 推荐先实现账号密码 + 已绑定手机号验证码。** 微信扫码评估为后续独立接入项；现有微信用户可使用已绑定手机号登录，不要求重新注册。只有微信且无可用手机号/密码的存量账号需要先在既有账号设置中补绑，或在发布前补齐扫码接口；不能承诺该类账号已经覆盖。注册、找回密码继续进入原站流程。

### 1.4 UserGroup 的职责

可读界面体现：`pubconfig[opencreatehd]` 是否允许创建活动，`maxhd` 活动数，`isfree` 免费发布，`minperson/maxperson` 人数区间，`openfree` 人数不计费，`freeperson` 免费人数，`oneprice` 人数单价，以及模块、增值服务、套餐、满减、短信通道、OEM、免费活动配置。

`edit2.html` 还存在顶层 `isfree/maxhd/maxhdperson/modules` 等旧形态；当前序列化和归一化方式无法从加密 service 确认。不要挑一套模板就写死数据库 JSON 结构。

UserGroup 是商业分组；页面还另有 `roles`、`UserRole` 和权限控制。不要混淆管理员 RBAC 与产品权益。

### 1.5 订单、支付、退款、续期

确认存在 Sysorder/HuodongOrder 及各自 refund 模型、订单 service、微信/支付宝 service、notify 控制器和支付 SDK。可读页面显示：

- 用户订单：`account/order`、`gopay`、`queryorder`、`closeorder`；字段包含 `id, tradeid, paytype, payfee, status, statusname, fromtype, payinfo, isrenewal, refund_id`。
- `paytype=1` 页面显示微信，`2` 为支付宝；可配置通道开关。
- 订单页面将 `status=2` 用于待支付操作、`1` 用于已支付相关展示、`4` 用于退款单号展示。完整枚举、退款中状态和实际状态机仍未知。
- `fromtype=3/4` 页面分别显示红包/短信充值；模块、人数、活动续期也复用订单显示。不要自行占用未知 `fromtype` 数字。
- 后台有 `weborder/forcepay`、`refund`、`closeorder`；退款 UI 明确提示“发起退款申请成功，请稍后查询退款结果”，不是即时退款成功。
- 活动购买提交 `hdid`、人数/模块/天数等，页面展示人数＋功能＋增值服务＋天数费用；续期页选择活动正式时间及 `daynum`。

推断：Sysorder 更接近平台向后台用户销售的账单，HuodongOrder 更接近活动参与者支付。**模型与控制器的实际对应关系不可读，不能据此断言调用签名、表关系或支付资金用途。** 首选核实 Sysorder 能否承载新产品；不往可能属于参与者/活动收款的 HuodongOrder 强塞桌面订单。

回调验签、金额校验、事务、并发幂等、渠道退款支持程度、续期副作用均未证实。微信/支付宝入口存在，不代表两个通道所有退款路径都已可直接复用。

## 2. Reusable：继续复用的能力

| 能力 | 复用方式 | 前提 |
|---|---|---|
| User 身份及 ID | 所有 Desktop 表引用原用户 | 核实 DDL 与有效状态判断 |
| 已有密码/手机号验证 | 通过小范围 LegacyUserAdapter 调用或适配已验证规则 | 必须能独立校验凭据，不触发 Web 会话/踢人 |
| 微信账号绑定 | 保留原绑定，服务端将经验证的微信身份映射到 User | 核对实际 AppID 与 OpenID 命名空间 |
| Web 注册、找回、账号资料管理 | 继续由网站完成 | Desktop 不复制账号管理功能 |
| MySQL、Redis、Webman | 新增独立 API 命名空间及模块 | 隔离全局日志、默认路由和中间件影响 |
| 支付商户、渠道、验签/查单/退款能力 | 现有服务上的产品订单适配 | 沙箱/测试订单核实回调与扩展点 |
| 运营后台/管理员身份 | 新增 Desktop 授权/设备/审计页面 | 复用管理员鉴权，另加最小操作权限 |
| 旧 UserGroup | 作为运营分群及可选赠送来源 | 只在服务端映射，不默认赠送 Desktop 权益 |

“复用”不等于原服务零改动直接调用：加密组件的扩展能力属于开发前验证条件。

## 3. Cannot Reuse Directly：不直接复用的逻辑

- Web Session、PHPSID、7 天自动登录和单点挤下线：不适合 Desktop 多设备长登录。
- `UserGroup == 3`、旧模块 ID、免费人数/价格、活动天数：不进入客户端判定逻辑。
- `freeendtime`：不能作为 Pro/AI 到期时间；`loginlimittime` 也不能直接代表“买了 Pro”。
- 网页登录控制器：不能在 Desktop service 里模拟 HTTP 登录、保存 Cookie 或以网页跳转成功作为授权证明。
- `hdid`、旧创建活动和续期副作用：不能成为本地活动/桌面订单必填参数。
- 旧订单 `status`、`fromtype`、`payinfo`：经适配后使用，不作为新产品公开协议。
- 浏览器“已完成支付”、客户端上报金额/套餐/购买结果：均不是权益生效依据。
- 旧 `authkey`、AES 配置：不能复用为 Desktop License 签名私钥，更不能打包客户端。

## 4. Target Architecture：目标架构与代码位置

```text
hd.ufunet.cn（服务端，保持现有 Web 行为）
  原 User ── LegacyUserAdapter ───────────────┐
  原 UserGroup ── 可选赠送映射 ──────────────┤
  原订单/微信/支付宝 ── 产品订单适配/幂等发放 ─┤
                                           ↓
                                  Product Entitlement
                                           ↓
  Desktop Auth / Session ─────── Desktop API v1
                                           ↓
                                 Offline License 签名器
                                           ↓ HTTPS
有范抽奖客户端
  OS 凭据库：Refresh Token / 安装标识
  License 验签与期限策略 → 本地能力判定
  本地活动 / 名单 / 奖项 / 舞台 / 双屏 / 中奖结果
  核心抽奖流程不调用云端
```

推荐仍部署在现有应用内，不新增微服务或第二用户系统。新增代码按职责划分，实施时建议：

| 位置（建议，尚未创建） | 职责 |
|---|---|
| `app/desktop/controller/` | Auth、Me、Entitlements、License、Devices，薄控制器 |
| `app/common/service/desktop/` | 认证/Token、User 适配、权益计算、签名、订单适配；每类职责独立 |
| `app/common/model/desktop/` | 新表模型，不复制旧 User |
| `app/middleware/DesktopAuth.php` | Bearer 校验、当前 User/设备/会话状态、JSON 错误 |
| `config/desktop.php` | 非秘密策略、SKU/套餐能力目录；密钥通过部署环境引用 |
| `config/route.php` | 明确注册 `/api/desktop/v1/*`，绑定 desktop 控制器，不依赖自动路由猜测 |
| `database/migrations/` | 后续经 DDL 核实后的增量 migration |
| `tests/desktop/`、`docs/` | 契约、安全、兼容测试及运维说明 |

必须封住 desktop 控制器可能被 Webman 默认路由以另一地址访问的入口；精确方法限制和鉴权作用于所有可达入口。不全局关闭旧默认路由破坏其他模块。全局加密日志无法证明可脱敏时，新增路由暂不能上生产；需要组件支持或只对 Desktop 前缀隔离日志链，旧路径保持原行为。

## 5. Database Changes：新增模型和约束

以下是逻辑字段设计，不是可执行 SQL。实际前缀、User ID 类型和外键策略以 DDL 为准。新 ID 可用 UUID；时间统一 UTC，API 时间采用 RFC3339，License 采用整数 Unix 秒。金额使用最小货币单位整数，不使用 float。

### 5.1 V1 新表（七张）

| 逻辑表 | 最小字段 | 约束与用途 |
|---|---|---|
| `desktop_devices` | `id, user_id, installation_id, device_name, platform, app_version, first_active_at, last_active_at, revoked_at, revoke_reason` | 唯一 `(user_id, installation_id)`；账号＋安装实例；不收硬件序列号 |
| `desktop_sessions` | `id, user_id, device_id, created_at, last_used_at, idle_expires_at, absolute_expires_at, revoked_at, revoke_reason` | 一次有效登录/Token family；用户和设备归属必须一致 |
| `desktop_refresh_tokens` | `id, session_id, token_hash, issued_at, expires_at, used_at, replaced_by_id, revoked_at` | `token_hash` 唯一；保留旧 token hash 以检测重放，事务轮换 |
| `product_entitlements` | `id, user_id, product_code, plan_code, policy_version, features_snapshot, limits_snapshot, starts_at, ends_at, status, source_type, source_key, created_at, revoked_at, revoke_reason` | 一行一个来源授权；唯一 `(source_type, source_key, product_code)`；索引 `(user_id, product_code, status, ends_at)` |
| `product_order_items` | `id, user_id, legacy_order_kind, legacy_order_id, sku, product_code, plan_code, quantity, amount_minor, currency, policy_version, benefit_snapshot, fulfillment_state, fulfilled_at` | V1 一单一 SKU；唯一 `(legacy_order_kind, legacy_order_id)`；只允许已核准的平台订单种类 |
| `entitlement_events` | `id, event_key, user_id, entitlement_id, product_order_item_id, action, actor_type, actor_id, reason, before_snapshot, after_snapshot, created_at` | `event_key` 唯一；发放/退款/撤销/改期的审计与幂等记录，不记 Token/个人秘密 |
| `offline_license_issues` | `id, user_id, device_id, session_id, sequence, kid, payload_hash, issued_at, offline_until, entitlement_snapshot, revoked_at` | 唯一 `(device_id, sequence)`；签发与售后追踪，撤销标记不会远程擦除离线文件 |

Redis 保存 Access Token 哈希映射（10 分钟 TTL）、验证码挑战与限流计数。Refresh Token 的持久事实留在数据库；Redis 故障使在线鉴权返回 503，但不影响已经获得 License 的本地活动。

`product_entitlements.status` 建议只存 `active/revoked`；`scheduled/expired` 根据时间计算，不能等待定时任务更新状态才失效。审计表保留事件，原授权行可撤销，不物理覆盖来源历史。

V1 产品/套餐目录以服务端配置维护并版本化，不急着新增通用商品引擎。日后运营需要后台改价再建 catalog 表。配置不是秘密，可以入库管理或随版本发布；价格和能力必须由服务端决定。

### 5.2 关系和发放优先级

- User 1:N Device/Session/Entitlement；User 表不新增“desktop_password”等字段。
- 一个订单项发放一个产品授权；Pro SKU 自带基础运行能力，不要求另买 Basic。
- 管理员授权来源 `admin`，业务事件 UUID 作为 source_key，写操作者、原因、有效期和能力版本；不能仅改 group_id 代替授权。
- 订单授权来源 `order`，source_key 使用有命名空间的订单项 ID；同一来源重复处理不延长第二次。
- UserGroup 赠送 V1 默认关闭；需要时显式配置组→固定套餐映射，并生成来源可追溯的 `group_grant`。在权益读取/签发时核对当前组和截止时间，离组停止该来源；不触碰独立购买/管理员来源。
- 服务端先检查 User 是否有效，再计算各来源当前生效的能力。同能力布尔值做 OR，设备数等限额 V1 取最大值，AI 额度不以 OR/最大值代替计费账本。
- 退款只撤销对应订单来源；其他有效授权继续生效。不用“退款即清空这个用户全部权益”。
- `entitlements_version` 是服务端计算的稳定快照摘要，涵盖当前账号状态、各有效来源、能力与政策版本；时间过期仍按当前时间计算，不靠版本是否变化决定有效性。

### 5.3 产品与能力目录

| Product / plan | 返回能力 | 离线性质 |
|---|---|---|
| `lottery.desktop` / `basic` | `excel_import, csv_import, dual_screen, offline_mode, result_export` | 本地可用；名单容量由本地性能约束，不继承旧按人数计费 |
| `lottery.desktop` / `pro` | Basic 全部 + `premium_themes, custom_branding` | 下载完的主题/本地品牌资产可用 |
| `lottery.theme.premium` / `addon` | `premium_themes` | 可独立加购；运行仍需有效 desktop 基础权益 |
| `lottery.ai` / `addon` | `ai_theme, ai_background`，另返回 quota 摘要 | 生成必须在线且服务端扣额度；已生成并保存的资产可离线使用 |

因此不另设 `lottery.desktop.pro` 为第二个独立产品；Pro 是同一桌面产品的套餐。展示用 `plan` 不参与硬编码功能判断，业务判断读 `features`。未知 capability 默认关闭，新增能力无需改旧客户端，但真正使用新功能仍需要对应客户端实现。

无产品权益的既有用户仍可登录、看设备/购买入口；不能凭 User 正常就默认为已购买 Pro。是否免费赠送 Basic 是商业决策，初始不自动发放。

### 5.4 旧表改动边界

优先零改 User/UserGroup/旧活动表。先通过 `product_order_items` 关联已有平台订单；如果 Sysorder 必須增加独立业务类型，核对全部分支后新增不会冲突的 discriminator，并以明确 allowlist 路由新业务，不能“造一个 hdid=0 活动”或挪用充值类型。

如果加密订单 service 无法扩展为无活动副作用的产品订单，则不能先写入 Sysorder 再碰运气。后续应取得可用扩展点/供应方支持，再决定由现有支付服务承载独立商品订单记录；该条件分支需要更新表设计，不会在本轮创建另一支付网关。没有验证扩展点之前，支付开发阶段不得开始。

## 6. API Design：第一版契约

### 6.1 共通规则

建议前缀 `/api/desktop/v1`，全部 HTTPS/JSON。无 Cookie、无 Web Session；服务器忽略客户端提交的 User ID 或 group_id，所有用户归属来自当前认证结果。

成功：`{"data": {...}, "request_id": "...", "server_time": "2026-09-21T10:00:00Z"}`。
失败：`{"error":{"code":"TOKEN_EXPIRED","message":"登录凭据已过期","retryable":false},"request_id":"..."}`。

使用标准 HTTP 状态，不继续沿用所有结果 HTTP 200、业务 `code=-1` 的网页风格。带 Token/License 的响应 `Cache-Control: no-store`。日志只记 request_id、结果码、非敏感主体标识、耗时；Authorization、密码、验证码、refresh_token、License 全文均脱敏。

### 6.2 最小接口表

下表 Response 指 `data` 内部；登录与刷新不隐式签 License，License 失败不应被误判成密码登录失败。

| 方法与路径 | Request | Response | Authentication |
|---|---|---|---|
| `POST /auth/challenges` | `{purpose:"password_login"或"sms_login", installation_id}` | `{challenge_id, captcha_image, expires_in:120, methods:["password","sms"]}`；图片为内联数据，不依赖 Cookie | 无；按 IP/安装限流 |
| `POST /auth/sms-code` | `{mobile, challenge_id, captcha_answer, installation_id}` | `{sms_challenge_id, expires_in:300, retry_after:60}` | 无；有效且一次性图形挑战，服务端手机号/IP/安装限流 |
| `POST /auth/login` | 下述 password 或 sms 联合类型，加 device 信息 | TokenPair、user 摘要、device、session | 无；验证凭据并检查账号状态 |
| `POST /auth/refresh` | `{refresh_token}` | 新 TokenPair，保留同一 session_id | Refresh Token；原子轮换与账号/设备检查 |
| `POST /auth/logout` | `{refresh_token}` | HTTP 204 | Refresh Token；只撤销其所属 session；已撤销 token 重试也返回 204 |
| `GET /me` | 无 | 用户摘要、session/device ID、account_expires_at | Access Token |
| `GET /entitlements` | 无 | 当前产品/能力、有效期、limits、version、server_time | Access Token |
| `POST /license` | `{product:"lottery.desktop"}` | `{license: SignedEnvelope, renew_after}` | Access Token；当前设备由 session 决定；服务端现算权益 |
| `GET /devices` | 无；V1 每账号数量有限不分页 | `{items:[{id,name,platform,app_version,last_active_at,revoked_at,is_current}],limit}` | Access Token；仅本人 |
| `DELETE /devices/{id}` | 无 | HTTP 204 | Access Token；仅本人；撤销该设备全部 sessions，停止签发 |

共十个接口；不单独重复建立 sms-login、注册、密码修改、每种套餐一个接口。挑战失效重新获取；验证码存 hash、按用途＋挑战＋手机号＋安装绑定，不明文落日志。账号不存在与存在使用相同发码响应外观，未注册号码不自动创建 User。服务端需兼顾时延差异和手机号枚举风险，错误提示统一。

建议限流初值：短信同号码 60 秒一次、每天 10 次；每验证码最多 5 次尝试；密码按账号及 IP 双维度限制并渐进冷却，触发后返回 429/Retry-After。具体容量可配置并通过运营实测调整；前端倒计时不代替服务端限流。不照搬手机号前端正则作为唯一验证。

### 6.3 登录和权益示例

账号密码请求（示例值，没有真实凭证）：

```json
{
  "method": "password",
  "username": "existing_user",
  "password": "<仅通过TLS发送，不落日志>",
  "challenge_id": "ch_example",
  "captcha_answer": "abcd",
  "device": {
    "installation_id": "84e1c6b0-f5c9-4d75-b0bb-a0e7927eb39b",
    "name": "会场 MacBook",
    "platform": "macos",
    "app_version": "1.0.0"
  }
}
```

短信请求用 `method:"sms", mobile, sms_challenge_id, code, device` 替换密码字段；拒绝同时传两套凭据。`platform` 为 `windows|macos`，installation_id 在首次安装生成，不从硬件推导。名称/版本长度有限，服务端视为不可信展示输入。

TokenPair 核心：`access_token, token_type:"Bearer", expires_in:600, refresh_token, refresh_idle_expires_at, refresh_absolute_expires_at, session_id, device_id`。Token 内容为随机 opaque 字符串，客户端不解码。

权益示例：

```json
{
  "version": "ent_snapshot_example",
  "products": [
    {"code":"lottery.desktop","plan":"pro","state":"active","ends_at":"2027-09-21T10:00:00Z"},
    {"code":"lottery.ai","plan":"addon","state":"active","ends_at":"2026-10-21T10:00:00Z"}
  ],
  "features": {
    "excel_import":{"enabled":true,"execution":"local","valid_until":"2027-09-21T10:00:00Z"},
    "dual_screen":{"enabled":true,"execution":"local","valid_until":"2027-09-21T10:00:00Z"},
    "offline_mode":{"enabled":true,"execution":"local","valid_until":"2027-09-21T10:00:00Z"},
    "premium_themes":{"enabled":true,"execution":"local","valid_until":"2027-09-21T10:00:00Z"},
    "custom_branding":{"enabled":true,"execution":"local","valid_until":"2027-09-21T10:00:00Z"},
    "ai_theme":{"enabled":true,"execution":"online","valid_until":"2026-10-21T10:00:00Z"},
    "ai_background":{"enabled":true,"execution":"online","valid_until":"2026-10-21T10:00:00Z"}
  },
  "limits":{"device_slots":2},
  "ai_quota":null
}
```

展示层可以显示产品与计划；实际能力判定读 feature。`ai_quota:null` 表示本阶段尚不提供额度服务，不等于无限额度。无权益返回 HTTP 200 空 products/禁用 features；申请 License 返回 `ENTITLEMENT_REQUIRED`。

### 6.4 错误码和客户端动作

| HTTP | Code | 行为 |
|---|---|---|
| 400 | `INVALID_REQUEST / CHALLENGE_INVALID / CHALLENGE_EXPIRED` | 修正输入/重新挑战 |
| 401 | `INVALID_CREDENTIALS` | 统一提示凭据不正确，不暴露用户是否存在 |
| 401 | `TOKEN_EXPIRED / TOKEN_INVALID` | 前者允许一次 single-flight refresh；后者停止重试并要求重新登录 |
| 401 | `REFRESH_EXPIRED / REFRESH_REUSED / SESSION_REVOKED` | 清除在线登录态；有效本地 License 按离线规则独立处理，不能直接把所有授权错误当网络故障 |
| 403 | `ACCOUNT_DISABLED / ACCOUNT_PENDING / ACCOUNT_EXPIRED / DEVICE_REVOKED` | 明确有效拒绝，持久记录对应禁用范围，停止新授权/新场次；已开始场次见第 8 节 |
| 403 | `ENTITLEMENT_REQUIRED / ENTITLEMENT_EXPIRED` | 显示购买/续费入口；只影响对应产品，不能清空其他独立权益 |
| 404 | `DEVICE_NOT_FOUND` | 对不存在和不属于本人设备统一响应 |
| 409 | `DEVICE_LIMIT_REACHED` | 管理设备，不踢掉另一台正在演出的电脑 |
| 429 | `RATE_LIMITED` | 遵守 Retry-After，无限重试禁止 |
| 503 | `AUTH_UNAVAILABLE / LICENSE_UNAVAILABLE` | 指数退避；保留原有效 License，不覆盖为空、不延长期限 |

离线验签错误属于客户端域：`LICENSE_INVALID_SIGNATURE / LICENSE_WRONG_DEVICE / LICENSE_EXPIRED / CLOCK_UNTRUSTED / LICENSE_SCHEMA_UNSUPPORTED`，不得使用损坏证书启用付费功能；仍允许查看/导出自己的数据。

### 6.5 购买与微信的 API 范围

V1 购买放在原网站新增的产品购买页，用系统浏览器打开。浏览器正常登录原站，客户端不传 Access/Refresh Token 到 URL，也不依赖浏览器 Cookie 维持登录。用户返回客户端点“同步权益”，只调用 `/entitlements`、`/license`，所以 V1 无需 Desktop 下单 API。客户端与购买账号不一致时显示账号摘要提醒，不能因当前浏览器完成支付就给另一个客户端 User 授权。

微信若纳入后续版本：新增短时 Desktop 登录事务创建、轮询/兑换接口及独立服务端回调。每笔事务绑定高熵 secret 或 PKCE S256 challenge、device、有效期及一次性状态，客户端凭 transaction secret/PKCE verifier 兑换 Token。微信回调经官方服务端校验后用 `(appid, openid)` 映射原 User；不能把客户端 OpenID 或 Web socket 成功消息作为凭据。新网站应用 AppID 的 OpenID 不保证等于现有公众号 OpenID；UnionID 是否可得也必须确认。绑定冲突进入既有账号绑定流程，不能静默合并账号。

若采用 OAuth 授权页，使用系统浏览器、state、PKCE 和严格登记的回跳地址，避免内嵌 WebView长期保留登录会话。参照 [RFC 8252 原生应用授权实践](https://www.rfc-editor.org/rfc/rfc8252.html)。V1 自有账号凭据接口是第一方认证适配，不宣称实现 OAuth Password Grant；将来有标准授权服务时优先切换 Authorization Code + PKCE，不建设面向第三方的密码授权协议。

## 7. Auth Flow：Token 与退出

### 7.1 在线登录

1. 客户端生成安装 UUID，保存在 OS 受保护存储，收集可修改设备显示名。
2. 获取 Desktop 图形挑战；用账号密码，或先发/验证手机验证码。密码仅存在于提交所需的短时内存。
3. LegacyUserAdapter 识别同一原 User，并验证当前状态、有效期及锁定规则。未知算法未核验前不得实现猜测性校验。
4. 在事务内锁定该用户设备配额，登记/更新设备。建议 Basic/Pro V1 都为 2 个激活安装实例；它是激活上限，不是离线并发检测。已有安装再次登录不重复占名额。
5. 为当前设备建立新 session；同一设备旧 session 可原子撤销，其他设备与 Web Session 不受影响。
6. 返回 TokenPair，保存 Refresh Token；请求权益和 License，验签后原子替换本地授权。首次从未激活的电脑必须在线一次。

### 7.2 Access Token

推荐 32 字节 CSPRNG 生成随机 opaque Token，10 分钟有效。只访问 Desktop API；前缀可区分 access/refresh。服务端只存 SHA-256 摘要到 Redis，映射 user/session/device/expiry。随机高熵 Token 使用快速摘要即可，不把它与低熵密码哈希混为一谈。

V1 不用 JWT Access Token：同一个后端可直接查会话撤销状态，省去 JWT 黑名单和 claim 失效复杂度。每个受保护请求检查 session/device 及 User 当前资格；User 资格读取失败返回 503，不使用长期缓存放行。当前能力另由权益计算，不从 Token 内带的套餐快照判断。

### 7.3 Refresh Token

同样至少 32 字节随机值，数据库只存 hash。30 天闲置、90 天绝对期限：每次成功刷新将 idle 到期设为 `min(now+30d, session.created_at+90d)`；达到绝对期限要重新验证身份。

事务锁当前 token 和 session：检查未撤销、未使用、未过期、User/device 有效 → 标记旧 token 已消费 → 创建新 token hash 并关联 `replaced_by_id` → 提交 → 返回新 pair。每次只允许一个有效后继。旧 hash 保留到该 family 绝对期限及审计保留期结束。

客户端主进程 single-flight 刷新，其他请求等待。严格轮换：已使用旧 token 再次出现，撤销该 family 并重新登录，不撤销其他电脑。响应丢失后旧 token 重试可能触发同样保护，这是 V1 明确接受的代价；不得无限重试旧 token。原有效离线 License 可继续运行，避免认证重试影响现场。后续若确有需求，可设计经过审计的短时幂等恢复，不在 V1 放宽重放策略。

轮换及重放检测依据 [RFC 9700 §4.14](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14)。这里借鉴安全机制，不声称本项目已具备 OAuth 服务器。

### 7.4 客户端保存

Windows 用 Credential Manager 或当前用户作用域 DPAPI；不要使用机器级共享作用域。macOS 用 Keychain，限制本应用访问，授权材料不随普通活动包导出。Access Token 默认仅在主进程内存；Refresh Token 在 OS 凭据库。系统存储不可用时不回退到明文文件，允许当前会话使用并提示无法保存登录。

DPAPI 通常绑定同一用户/电脑，但不是硬件防复制保证，参见 [Microsoft CryptProtectData](https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata)。Keychain 适合存少量敏感信息，参见 [Apple Keychain services](https://developer.apple.com/documentation/security/keychain-services)。

不存到 localStorage、SQLite 明文字段、日志、URL 查询参数或前端渲染上下文。后续选 Electron/Tauri 时将凭据访问与 License 校验留在可信主进程/原生侧，以窄 IPC 返回功能状态。

### 7.5 退出、禁用和设备撤销

- 在线退出：撤销当前 session 及整条 refresh family；Access Token 因会话撤销立即失效。本地移除登录凭据与当前账号 License 激活引用；保留用户活动数据。设备记录保留用于审计，退出不等于释放激活名额；释放名额用“移除设备”。
- 离线退出：本地立即退出并清除 Refresh Token/激活引用，不能承诺服务器已撤销。已被窃取的 Refresh Token 最迟受 30 天闲置/90 天绝对期限约束；用户可从网站或另一在线设备撤销。V1 不为后台补交退出而悄悄保留可登录凭据。再次联网登录同安装时撤销该安装旧 sessions。
- 管理员禁用/待审核/账号到期：每次 Desktop 请求读取原 User 当前资格；已禁用用户不能登录、refresh、签证书或使用在线权益。新实现不依赖必须改造旧管理员保存按钮才能察觉禁用。
- 修改密码/找回：核实旧系统是否有稳定凭据版本字段/事件；若没有，新增适配所需钩子后撤销 Desktop sessions。不能在没有旧事件证据时宣称“改密码自动退出所有客户端”已经可实现。
- 远程移除设备：撤销该 device 全部 sessions，今后在线拒绝；离线文件只能按第 8 节到期/感知。重新激活需再次完整登录且有名额，不能凭旧 refresh_token 复活。
- 凭据失效与商业授权不同：Refresh 过期不等于已退款；但明确设备/账号撤销是权威状态，客户端不得无条件当作断网继续开新场次。

## 8. Offline License Flow：现场可靠性与失效边界

### 8.1 签名载荷

使用 Ed25519 非对称签名；服务端保存私钥，客户端内置可轮换公钥集合。PHP 有 `sodium_crypto_sign_detached`，但需实际确认生产 ext-sodium 可用及跨语言测试；PHP 版本声明不是扩展存在证明。参见 [PHP Sodium 签名文档](https://www.php.net/manual/en/function.sodium-crypto-sign-detached.php)。

为减少 JSON 重序列化差异，建议固定格式：

```text
Envelope = { payload_b64: base64url(UTF8_JSON_BYTES), signature_b64: base64url(signature) }
signature = Ed25519.sign("UFUN-DESKTOP-LICENSE-V1\n" || payload_b64)
```

签原始 base64url payload 字符串，不让客户端解析 JSON 再序列化验签。payload 内 `kid` 只允许选择已内置的公钥；不从 payload 中下载公钥、接受新算法或取任意密钥 URL。解码有长度上限、拒绝重复 JSON 键/错误类型；验证签名后才信任 claims。算法在协议版本中固定，不能接受 `none` 或客户端自选算法。

载荷形状（时间为符号说明，不是可直接签发 JSON）：

```text
schema_version: 1
issuer: "https://hd.ufunet.cn"
audience: "lottery.desktop"
kid: "desktop-license-2026-a"
license_id: UUID
user_id: 原 User ID 的字符串
device_id: 服务端设备 UUID
installation_id: 安装 UUID
session_id: 签发来源会话
sequence: 当前设备单调递增签发序号
product: "lottery.desktop"
plan: "pro"                    # 仅展示
entitlements_version: 服务端快照摘要
issued_at: t0
not_before: t0 - 300
expires_at: 基础产品商业到期（长期授权可 null）
account_expires_at: 账号截止时间或 null
offline_until: 基础运行的离线截止时间
renew_after: 推荐下次联网续签时间
features: {
  excel_import: {enabled:true, valid_until:Tbase},
  csv_import: {enabled:true, valid_until:Tbase},
  dual_screen: {enabled:true, valid_until:Tbase},
  offline_mode: {enabled:true, valid_until:Tbase},
  result_export: {enabled:true, valid_until:Tbase},
  premium_themes: {enabled:true, valid_until:Ttheme},
  custom_branding: {enabled:true, valid_until:Tbrand}
}
limits: {device_slots:2}
event_grace_seconds: 86400
```

`ai_theme/ai_background` 不进入离线可执行能力；若为了展示加入，必须标记 execution=online，本地 license 永远不能成为调用 AI 的 API 凭证。

每个能力独立计算连续有效的授权区间：多个来源覆盖同能力时先合并相交/首尾相连区间，不跨越授权空档取最大 ends_at。`valid_until = min(该能力连续授权终点, account_expires_at, t0+15d)`；null 当无限上限处理。基础 `offline_until` 为基础运行必要能力的有效上限。这样 Premium 附加包明天到期不会误使全年 Basic 后天断网无法用；到期的 Premium 自己关闭。尚未开始且与当前不连续的续费不能提前放入当前 License。

**`expires_at` 是商业期限，`offline_until` 是需要重联的截止，不是同一概念。** 长期授权仍签有限的离线票。License 不包含密码、手机号、OpenID、参与者名单或签名私钥。

### 8.2 7/15/30 天取舍

| 周期 | 好处 | 成本 | 建议 |
|---|---|---|---|
| 7 天 | 退款/盗用的离线残留短 | 长途出差、备用电脑容易现场过期 | 可用于短期试用，V1 不默认 |
| 15 天 | 覆盖常见提前准备及连续活动 | 最坏存在约半月撤销延迟 | V1 默认 |
| 30 天 | 长期弱网方便 | 退款后残留更长、复制窗口更大 | 后续明确合同/套餐才启用 |

联网且距上次成功签发满 24 小时后后台尝试续签；进入“现场准备”时主动尝试一次，剩余少于 3 天明显提示。网络失败保留已有有效 License。新 License 完整下载、验签、检查设备和序号后原子替换；不能先清除旧证书。签发服务只用服务端时间、权益和当前设备，客户端不能指定 offline_until/features。

### 8.3 本地启动与现场准备

1. 启动先读本地 License，验证签名、issuer/audience、schema、device/installation、序号、时间和能力。不等待网络，不要求 Refresh Token 尚有效。
2. 有效时可打开活动、导入 Excel/CSV、配置奖项、抽奖、双屏、持久记录/导出；本地主题、字体、音视频提前缓存，不能由远程 CDN 成为核心运行条件。
3. 显示“离线可用至 X”；检查名单、资产是否已在本机和预计活动结束时间是否被当前授权覆盖。用户明确点击“进入现场”后生成本地活动运行记录，覆盖准备/彩排到执行阶段。
4. 本地运行记录绑定 `local_activity_id, license_id, sequence, started_at, finish_by`，写入受保护的状态；崩溃重启恢复原记录和中奖结果，不重置开始时间。
5. 现场网络失败、Access/Refresh 过期不打断场次；停止新在线功能请求即可。后台续签不阻塞舞台线程和抽奖事务。

### 8.4 续场窗口：有上限的明确承诺

仅延长离线周期不能覆盖“临近到期开始准备”的边界，需单独定义续场规则：

```text
只有在基础 License 当前有效、相关功能当前有权且未获知权威撤销时，才可进入现场。
finish_by = min(started_at + 24h, offline_until + 24h)
```

基础必要授权在 started_at 有效，所以通常 finish_by 就是 started_at+24h。这是单场最多 24 小时的现场保护，不是每次启动加 24 小时；不允许用同一场次重复进入延长、复制活动 ID 重置过期窗口。离线票到期后不能建立新场次。

若自然到期/已获知退款或禁用发生在这一场已经开始后，停止签发及新场次、立即停止 AI 等在线消耗；当前场次只保留 started_at 时的本地功能直到 finish_by。有效证书正常运行时可更久，但“这场受保护现场”的截止不随后台续签自动滚动；长活动需要在授权仍有效时明确规划下一时段。

这意味着**商业到期允许已开始的本地场次最多额外 24 小时**，必须在产品政策中说明。默认 15 天离线票在未知退款/禁用后的最坏残留约为 15 天 + 24 小时，不承诺即时远程撤销。此保护规则由签名字段授权、客户端执行，适用正版客户端而非防破解硬保证。

仅在磁盘上创建活动、不进入现场，不获得永久豁免。如果用户 20 天完全离线且证书过期、也无有效续场记录，不能保证开始一场新的付费演出。这是有限离线租约与撤销能力的必然边界。若业务要求几个月预排活动仍离线履约，需要另行设计事先签发的活动票/更长离线政策，不把任意本地编辑当无限延期。

### 8.5 退款、禁用、到期的状态表

| 情况 | 在线服务端 | 正版客户端行为 |
|---|---|---|
| 临时断网、DNS/超时/5xx | 暂不可用 | 保留有效票、照常运行；不伪造续签 |
| Refresh 过期 | 要求重新登录 | 本地有效票继续用，在线功能待登录 |
| 明确退款已成功 | 对应来源撤销，重算其他来源 | 接收并持久化新权益；不再以旧票开启被撤销能力；已进入现场按窗口完成 |
| User 禁用/账号到期 | 拒绝新在线使用/签发 | 权威拒绝持久化；禁开新场，当前现场按保护规则完成 |
| 未联网感知上述变更 | 不能远程改变文件 | 到 offline_until 停止新场，已有现场最晚 finish_by 停止 |
| 单独主题包到期 | 只重算相应能力 | 停止新用高级主题；其他仍有效核心功能不受影响 |
| License 失效且无续場记录 | 不签新票 | 能查看/导出已存活动和中奖数据，不能开始新的受限抽奖 |
| 首次安装没有 License | 需要在线激活 | 不能宣称首次完全离线可认证 |

读取/导出自己的历史结果不作为续费“人质”。到期时不删除名单、改写中奖结果或弹窗遮断仍在保护期的大屏。当地时钟异常发现于已运行场次时先保全结果与画面，再按可验证的原截止限制新场。

### 8.6 时钟、回滚、私钥与轮换

以服务端签名 issued_at 为时间锚；记录 last_seen_server_time、最大已见时间和最大 sequence 于受保护存储。同一运行进程使用单调时钟计时；重启时结合系统时间与已有锚。允许有限偏差（例如 5 分钟），明显回拨要求联网校时，不能靠“把系统时间调回去”正常续签。

只接受不小于已接受序号的新证书；明确撤销状态持久化，不能退出重启退回旧 License。重新完整登录并由服务端重新激活/签发后才解除相应撤销状态。

普通桌面没有可信硬件与在线时间服务时，无法完全防御磁盘快照恢复、复制受保护状态、管理员改程序和长期时钟伪造。V1 保证签名防直接改字段，并对常见误操作/文件复制形成阻力，不承诺绝对反盗版。

签名私钥只在服务端部署秘密存储，限制读权限，独立于 Web authkey/支付密钥；不入 Git、不进入日志、数据库订单内容、客户端或构建产物。提前发布新公钥，再切换签发 kid；旧公钥至少保留到所签所有离线票及续场窗口结束。紧急密钥泄漏时在线停签/更新客户端，但断网旧客户端无法即时获知，这也属于离线边界。

## 9. Payment / Entitlement Flow：购买到生效

```text
原 User 在网站选择 Desktop SKU
  → 服务端校验账号可用、计算金额和授权周期
  → 原平台订单 + product_order_items 固化商品/权益快照
  → 现有微信/支付宝下单和收银页面
  → 服务端通知验签 / 主动向渠道查单确认
  → 幂等确认已支付
  → 原子发放 product_entitlements + entitlement_events
  → 客户端同步权益、获取新离线 License
```

### 9.1 支付安全与隔离

- 建订单时校验 User 有效期覆盖所售使用期；若不能覆盖，提示先解决账号期限，不收取明知无法使用的套餐费用。购买不会自动解禁用户或延长 loginlimittime。
- 金额、币种、SKU、期限、政策版本来自服务器，付款时固化权益快照。不得因后来改套餐配置而改变已购订单的承诺。
- 验签之外核对商户/AppID、订单号、币种、金额、渠道交易号和最终支付状态；不能只信回调的 paid 字样。
- `product_order_items` 是否存在决定新产品发放路径；旧订单继续原处理。新产品禁止执行旧“发布活动/增加人数/模块/活动续期”的副作用。
- `forcepay` 是否允许用于桌面商品需单独管理员权限和审计，不从旧 status=1 就认定渠道已到账。人工赠送优先用 admin grant，不伪造真实支付交易。

### 9.2 幂等、并发、回调丢失

同数据库可事务处理时，锁订单/商品项与对应用户产品发放范围，唯一业务事件键例如 `paid:<order_kind>:<id>`，一次性写授权和事件、更新 fulfillment_state。重复通知返回已处理，不能重复延长。两个不同订单并发续费时也须按 user+product 串行确定期限。

若原加密回调无法共享事务：支付已成功但发放失败时订单项保持 `pending`，可重试 worker/定期补偿读取已核验支付事实，幂等完成发放。不必新增消息中间件；用数据库待处理状态、唯一键和现有定时设施。网页前端查询/返回只能触发服务端查单，不直接触发未经核验的 grant。

收到乱序退款/付款事件须查询权威最终状态、锁定状态迁移；已成功退款的订单不能被晚到的支付通知重新激活。监控“已支付超过若干分钟仍未发权益”，给运营可查询的 request/order ID。

### 9.3 续费、退款与到期

同套餐 V1 每次付费产生独立来源授权，开始时间为 `max(付款确认时间, 当前同套餐连续覆盖区间终点)`，结束按 SKU 固定有效时长计算，并在订单上固化。不要累计覆盖旧 ends_at 丢失来源。不同套餐暂不做自动差价升级/自动续订，用户可购买独立时段，能力聚合按第 5 节规则执行。

退款：申请中不等于成功；渠道确认成功后只撤销该订单项产生的 grant，记唯一 refund event 并阻止重发。V1 支持全单全额退款闭环；部分退款在后续按订单项/剩余使用期制定政策，不能自动按金额比例猜权益。

若早期订单退款而后面有预排续费，后者原已购买起止时间保留，退款造成的中间空档不自动前移；客服需要补偿时另发带审计的调整授权。此规则简单且可追溯，避免退款改变不相关购买记录。

到期由每次查询/签发实时过滤时间；定时任务用于通知/补偿，不是访问控制正确性的前提。客户端按每项 valid_until 和续场规则失效。离线已签发证书的残留期需在退款政策和运营工具中可见。

## 10. Security：设备和信任边界

### 10.1 设备模型

需要 `desktop_devices`。`installation_id` 是 CSPRNG UUID，`device_id` 是服务端返回的账户设备行 ID。平台、名字、版本是展示元数据，可伪造，不作为身份认证。V1 不采集 MAC/CPU/硬盘序列号，不因 Windows 更新和网卡变化生成新安装 ID。

同安装、同账号重新登录更新原记录；更换账号建立相应账号关系。真正重装导致安装标识丢失视为新设备，允许通过网站/另一设备移除旧设备再激活。网站必须提供设备管理，否则“设备满额”的新用户没有可用 Access Token，会陷入无法自助释放名额的死循环。

已离线的被移除设备仍可能在期限内运行，所以 2 个激活槽不等于严格 2 台实时并发。V1 不售卖无法在离线条件下兑现的并发硬限制。

签名绑定 installation_id/device_id 可防止仅把 License 文件复制给普通另一安装使用；它不是秘密或强设备证明。把安装标识和所有状态一起复制、控制本机进程仍可能绕过。若商业盗用风险上升，后续可以加 OS 保存的每安装密钥与持有证明，无需引入硬件序列号绑定；V1 不以此为前置复杂度。

### 10.2 服务端和客户端职责

服务端是 User 状态、订单、在线权益、设备配额、签发时间的最终权威。客户端是离线执行者，只信受支持的签名格式与内置公钥。License 不是 Access Token，不能拿它请求在线 AI、退款或管理员接口。

原生应用是公开客户端，打包 client_secret 无保密意义。主进程不信任渲染层传入的路径、URL、features；限制 IPC。后续主题/AI 背景按数据和资源载入，不授予任意脚本访问本地凭据的能力。双屏窗口只接收渲染和舞台状态，不接收 Token。

后台所有授权/撤销操作使用既有管理员认证、CSRF 防护、最小权限和审计；Desktop 的 Bearer Token不能管理其他用户。API 校验对象归属、请求大小和字段类型；TLS 校验不可关闭；错误不输出密码 hash、数据库 SQL 或内部堆栈。

本轮发现 session 配置 secure=false、same_site 为空，这是仓库配置事实，不足以判断生产 Cookie 最终属性。本方案不顺带改造 Web 安全设置；Desktop 不沿用此 Cookie 设置。必须单独核实全局日志不记录新凭据，这是 Desktop 发布阻断项。

## 11. Compatibility：保持现有系统及本地边界

### 11.1 原有业务不受影响的实现约束

- 不新建第二用户表，不迁移/批量改写旧密码，不改变原 User ID。
- 不改 Web 登录返回值、PHPSID、Session TTL、Web 单点登录策略；Desktop 使用独立 Redis 前缀/会话表。
- 不把 UserGroup 模块/人数免费规则写回为 Desktop 产品开关；不将 Desktop 买单转成修改用户组。
- 不改变旧订单/回调的分支与语义；新 SKU 独立标识、后台展示单独字段。开关关闭时旧支付仍走原逻辑。
- 无需修改 importcj、现有大屏主题、活动配置、hdid 编码或参与者数据。
- 新产品/API 独立 feature flag，上线先少量账号。停用签发不影响未过期离线票；紧急回滚不能删除已售权益/订单。

当前只新增文档，所以这次操作没有业务回归风险。未来实现能否“完全不受影响”必须由旧用户、活动、订单、支付回归证据证明，不能仅凭模块图保证。

### 11.2 本地活动与云数据

| 数据 | V1 权威位置 | 说明 |
|---|---|---|
| 身份、账号状态、产品/价格、支付、授权/设备 | hd.ufunet.cn | 客户端只持必要缓存 |
| 本地活动、名单、奖项、抽奖状态、中奖记录 | 本机 | 现场不依赖云端事务；导入名单默认不上传 |
| 本地已下载主题/品牌/AI生成资产 | 本机副本 | 提前准备完整资源；生成服务未来仍在线 |
| License、Token | 本地授权存储/OS 凭据库 | 不混入活动导出包 |

本地活动以随机 UUID `local_activity_id` 为主键，`cloud_activity_id` 为可空附加映射。未来旧活动导入可以保存 `cloud_source="hd.ufunet.cn", cloud_activity_id=<原hdid>` 或独立 legacy_reference；hdid 若有编码，保留原字符串，不猜整数。导入后本地依然可独立运行。

不自动推导 UUID↔hdid，不在开活动时创建云活动。本地活动归属与当前商业登录分离，退出/换账号不会自动销毁原活动；在同一操作系统用户下如何展示活动属于未来本地权限设计，不把付费校验变成数据加密密钥。

未来同步只通过经过账号归属鉴权的显式 API，映射表附 source、local_id、cloud_id、version；同步须处理活动冲突、名单隐私和中奖记录不可盲目 last-write-wins。V1 只保留可空映射概念，不建云同步服务和完整抽奖数据库。

## 12. Implementation Plan：后续按依赖推进

本轮交付评估，不执行下面的开发任务。P0 核验结果必须更新本文；未核验事实不能在实现中用“常见做法”替代。

| 阶段 | 工作项 | 完成判据 |
|---|---|---|
| P0 事实核验 | 获得脱敏 DDL、合法可用的服务接口说明/测试环境；确认密码、状态、Session、订单、回调、全局日志 | 输出证据表，账号密码适配与无活动支付扩展点可证实；未通过不得发布相应功能 |
| P1 领域及契约 | 固定 API/错误码；确认账号有效期政策、Basic/Pro能力、15天/24h、设备槽、退款规则；评审增量 schema | 同一 User、来源授权模型、期限与退款行为无歧义；不执行用户迁移 |
| P2 Desktop Auth | 路由隔离、日志脱敏、凭据 adapter、挑战/短信、设备、Token轮换、网站设备管理 | 老账号测试通过；不写 Web Session、不踢 Web；无新增账号 |
| P3 Entitlement | 能力目录、管理员发放/撤销、来源聚合、期限、审计 | 多来源/重复发放/撤销/到期/并发覆盖测试通过 |
| P4 Offline License | 私钥部署、Sodium 签发、公钥轮换、最小跨平台验签验证器 | 跨语言签名向量及篡改/设备/时间/回拨/续场恢复通过；无需开发完整抽奖客户端 |
| P5 支付接入 | 网站商品页、原平台订单扩展、商品项、支付幂等、退款、补偿 | 微信/支付宝分别测试；重复通知、退款乱序、失败补偿不多发、不误续旧活动 |
| P6 灰度与回归 | 独立开关、审计和监控、回滚说明；测试用户小范围激活 | 旧登录、活动创建/续费、支付退款不回归；断网演出流程通过 |
| P7 后续独立范围 | 微信 Desktop 扫码、AI 额度/生成、主题商店、云同步 | 分项立项；不作为本轮开发内容 |

### 12.1 P0 必须补齐的证据清单

1. **User / UserGroup / Sysorder / HuodongOrder / 退款表 DDL**：由有授权的 DBA 提供 `SHOW CREATE TABLE`、列/索引/关联信息的脱敏导出；不需要用户行、手机号、密码 hash 或生产凭证。确定物理表名后再执行只读查询，不写猜测表名 SQL。
2. **旧凭据验证契约**：可调用方法、输入/输出、盐/哈希处理、用户名/手机号匹配、锁定、软删除、账号到期优先级；用专用测试用户验证，不能对真实客户批量试密码。无服务级接口则取得可读授权代码/供应方支持；不能抓网页绕过。
3. **Session 结构与副作用**：在隔离测试环境只记录键名/类型及会话变更，不采集真实 Session 值。确认 onlyone、remember-me 和更改密码路径对 Desktop 的影响。
4. **微信实际链路**：生产启用的是哪个 controller、公众号/网站 AppID、OpenID/UnionID 映射、首次登录的绑定/注册规则。`openwechat22.php` 不能单独充当生产证明。
5. **订单分类和回调扩展**：模型映射、业务类型枚举、状态机、金额单位、强制支付、退款结果、唯一索引、可添加无 hdid 的产品业务分支。确认两支付通道各自实际支持的退款方式。
6. **运行环境**：Webman 路由和全局中间件行为、日志脱敏、Redis 故障策略、PHP/扩展实测。不要只因 composer 允许 PHP7.2 就假定当前运行环境可签证书。

缺少上述信息不妨碍完成架构设计，但妨碍宣称“已确认真实表结构/密码算法/Session/回调安全”。本次明确留作开发前阻断项。

### 12.2 必要验证清单

| 维度 | 验收用例 |
|---|---|
| 身份兼容 | 旧密码/绑定手机号成功；密码错误、禁用、待审核、过期/删除账号失败；用户名大小写/中文与旧规则一致 |
| 会话隔离 | Web 登录不踢 Desktop，Desktop 不踢 Web；其他设备 refresh 不受当前退出影响 |
| Token | 10分钟到期、30天闲置/90天绝对期；并发refresh仅一个成功；旧token重放撤销family；响应丢失安全恢复登录 |
| 对象权限 | 用户A不能读/删B设备、取B License；伪造group_id/user_id/features无效；默认路由别名不能绕过鉴权 |
| 权益 | Basic/Pro/附加主题分开到期；赠送+购买叠加；只撤销退款来源；区间空档不误授权；并发续费不重叠丢时长 |
| 离线 | 断网冷启动、导入、双屏、结果记录/导出；现场许可证到期不断场；过期后不能新开；崩溃重启不重置24小时；无票首次启动提示激活 |
| 签名 | 改feature/expiry/device失效；错误kid/算法、重复JSON键、过大载荷拒绝；旧序号不覆盖新票；轮换期间旧票仍有效 |
| 时间/撤销 | 时钟回拨、跳未来、重启；已知退款/禁用持久化；未知撤销受15天+24h边界；临时5xx不清除证书 |
| 设备 | 槽位并发不能超额；硬件/网卡变化不变ID；重装可自助移除旧设备；远程移除不承诺瞬时离线失效 |
| 支付 | 各渠道正常/重复/乱序通知、金额不符、验签失败、付成功发放失败补偿、退款成功/失败、旧充值和活动续费无副作用 |
| 数据保护 | 到期/退出仍可查看导出；不上传名单；日志/崩溃上报无密码、Token和License全文 |

### 12.3 对原验收问题的直接回答

| 问题 | 结论 |
|---|---|
| 现有用户能否直接登录？ | 设计上复用同一 User，可用原账号密码/已绑定手机；密码验证实现必须经 P0 确认。仅微信且无其他凭据用户需补绑或后续扫码能力 |
| 客户端如何登录/保持登录？ | 独立 JSON 认证 API + 短 Access Token + 轮换 Refresh Token，系统凭据库保存；不存 Web Session |
| 买了什么如何判断？ | 服务端聚合来源可追溯的 Product Entitlement，客户端只读能力结果 |
| 为什么断网还能用？ | 已签发并本地验签的 License 提供有限离线租约，核心数据/资源/执行都在本机 |
| 如何防篡改？ | Ed25519 私钥只在服务端，客户端公钥验签；不能通过改 JSON 延期，但不宣称防止本机程序破解 |
| 退款/到期如何失效？ | 在线立即重算/停签，已知撤销禁止新场；断网最迟离线票截止，已进入现场可在固定24小时窗口内完成 |
| 支付能否继续使用？ | 继续复用既有渠道与平台订单能力；无活动副作用的业务扩展及两渠道退款需验证，不重新开发支付系统 |
| 如何解耦？ | 独立产品权益、API/会话、local_activity_id，客户端不认识group_id/模块价格/hdid计费 |
| AI/高级主题如何扩展？ | 新SKU映射稳定能力；高级主题可离线，AI在线单独计量和服务端授权；新增产品无需重建用户体系 |

## 附录 A：仓库证据定位

位置均相对目标仓库 `hd.ufunet.cn`；行号对应评估基线。界面可读证据不是数据库 DDL 或生产测试结果。

| 编号 | 文件及行号 | 支撑内容 |
|---|---|---|
| E01 | `composer.json:1` | Webman/ORM/支付/微信依赖声明 |
| E02 | `config/middleware.php:14` | 全局、web、myhome、myhd等中间件链 |
| E03 | `config/session.php:18` | Redis会话、PHPSID、TTL和Cookie配置 |
| E04 | `config/thinkorm.example.php:1` | 示例DB前缀；仅示例不是实际DDL |
| E05 | `app/web/view/usermanage/edit.html:15` | 状态1/2/3、账号/密码/组/手机/OpenID字段 |
| E06 | `app/web/view/usermanage/edit.html:101` | loginlimittime/freeendtime含义 |
| E07 | `app/web/view/usermanage/list.html:98` | ID、组、锁定和用户展示；角色管理见185起 |
| E08 | `app/myhome/view/profile/index.html:30` | 用户摘要、期限、手机/登录微信；密码修改见154 |
| E09 | `app/web/view/login/index.html:664` | 账号/手机请求参数和成功返回处理 |
| E10 | `app/web/view/login/index.html:720` | 图形挑战、短信入口和前端60秒倒计时 |
| E11 | `app/web/view/login/index.html:583` | socket扫码、makewxloginqr、首次手机号流程 |
| E12 | `app/web/view/loginreg/index.html:43` | 登录方式、图形码、onlyone设置 |
| E13 | `app/api/controller/openwechat22.php:162` | 可读微信绑定/登录调用；尚未确认生产启用 |
| E14 | `app/web/view/usergroup/edit.html:168` | 创建、数量、免费发布；人数价格见232起 |
| E15 | `app/web/view/usergroup/edit.html:502` | 套餐；freeconfig见608起 |
| E16 | `app/web/view/usergroup/edit2.html:53` | 另一组字段形态，不可猜服务存储 |
| E17 | `app/myhome/view/account/order.html:54` | 待支付、查单、关闭、订单字段；续期退款展示见222 |
| E18 | `app/web/view/weborder/list.html:69` | 强制支付、退款申请和关闭入口；user_id展示见151 |
| E19 | `app/common/tpl/web/themes/default/common/paytype.html:67` | 微信/支付宝UI选项及开关 |
| E20 | `app/myhd/view/createhd/pay.html:11` | 订单号、二维码支付 |
| E21 | `app/myhd/view/createhd/buymodules.html:343` | 人数＋模块＋服务＋天数，提交参数见425 |
| E22 | `app/myhd/view/renewal.html:30` | 活动期限、正式开始时间、续期天数 |
| E23 | `config/route.php:16` | 可读fallback，不能由此断言新增路由绕过全局中间件 |

本次外部技术依据仅用于新方案的签名、系统存储与授权实践，不用于推断旧业务。相关官方链接已放在对应设计段落。
