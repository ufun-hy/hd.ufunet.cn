import fs from 'node:fs';
import path from 'node:path';
import { svgDocument, header, imageFrame, glassPanel, chip, flowStep, browserChrome, phoneFrame, scanIcon, spreadsheet, palette } from './design-system.mjs';
import { products } from './content.mjs';

const root = path.resolve(import.meta.dirname, '..');
const project = path.resolve(root, '../..');
const svgDir = path.join(root, 'exports', 'svg');
fs.mkdirSync(svgDir, { recursive: true });

function data(relativePath) {
  const full = path.join(project, relativePath);
  const ext = path.extname(full).slice(1).replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${fs.readFileSync(full).toString('base64')}`;
}

const source = {
  bigcj: data('public/static/images/sys/preview/bigcj.png'),
  importcj: data('public/static/images/sys/preview/importcj.jpg'),
  shake: data('public/static/images/sys/preview/shake.jpg'),
  horse: data('public/static/images/sys/preview/horse.jpg'),
  hbwall: data('public/static/images/sys/preview/hbwall.jpg'),
  dzp: data('public/static/images/sys/preview/dzp.jpg'),
  lottery: data('public/static/images/sys/preview/lottery.jpg'),
};

function save(name, body) {
  fs.writeFileSync(path.join(svgDir, name), svgDocument(body), 'utf8');
}

save('01-qr-proof-1440.svg', `
  ${header('真实功能界面', '扫码抽奖', '手机参与 + 活动大屏同步开奖，一张图讲清产品怎么用')}
  ${browserChrome(72, 370, 820, 674, '活动大屏 · 微信扫码抽奖')}
  ${imageFrame(source.dzp, 96, 452, 772, 430, 18)}
  <rect x="112" y="900" width="738" height="112" rx="24" fill="#0e2d59"/>
  <text x="150" y="952" fill="${palette.white}" font-size="32" class="heavy">大屏显示奖项与抽奖结果</text>
  <text x="150" y="990" fill="${palette.muted}" font-size="24">现场画面、奖项轮次与中奖结果集中呈现</text>
  ${phoneFrame(948, 360, 392, 720, `
    <rect x="978" y="406" width="332" height="126" rx="24" fill="#e8f1ff"/>
    <text x="1144" y="452" text-anchor="middle" fill="#183b71" font-size="24" class="bold">手机参与端</text>
    <text x="1144" y="488" text-anchor="middle" fill="#5e7394" font-size="20">扫码进入活动</text>
    ${scanIcon(1062, 570, 164)}
    <rect x="1000" y="790" width="288" height="72" rx="36" fill="#397dff"/>
    <text x="1144" y="838" text-anchor="middle" fill="#fff" font-size="28" class="heavy">参与抽奖</text>
    <rect x="1000" y="892" width="288" height="126" rx="24" fill="#eef4ff" stroke="#b8d1f4"/>
    <text x="1030" y="938" fill="#294567" font-size="22" class="bold">参与流程</text>
    <text x="1030" y="978" fill="#657892" font-size="20">进入活动 → 点击参与</text>`)}
  ${chip('手机扫码参与', 86, 1118, 350)}${chip('大屏同步展示', 486, 1118, 350)}${chip('支持多轮奖项', 886, 1118, 350)}
  <text x="720" y="1328" text-anchor="middle" fill="#94aed5" font-size="25">适用：企业年会 · 婚礼庆典 · 商场活动 · 会议抽奖</text>
`);

save('02-qr-flow-1440.svg', `
  ${header('扫码后怎么抽', '3步现场开奖', '不是概念海报，直接展示买家最关心的参与路径')}
  ${flowStep(1, '扫码进入', '观众手机进入活动', 72, 376, 398)}
  ${flowStep(2, '手机参与', '点击按钮加入抽奖', 521, 376, 398)}
  ${flowStep(3, '大屏开奖', '现场同步展示结果', 970, 376, 398)}
  <path d="M470 453H521 M919 453H970" stroke="#61cfff" stroke-width="5" stroke-dasharray="10 12"/>
  ${glassPanel(72, 584, 1296, 558)}
  ${phoneFrame(112, 624, 310, 464, `
    <rect x="142" y="670" width="250" height="76" rx="22" fill="#e8f1ff"/><text x="267" y="718" text-anchor="middle" fill="#315781" font-size="23" class="bold">微信扫码抽奖</text>
    ${scanIcon(197, 782, 140)}
    <rect x="158" y="958" width="218" height="62" rx="31" fill="#397dff"/><text x="267" y="999" text-anchor="middle" fill="#fff" font-size="23" class="heavy">点击参与</text>`)}
  ${browserChrome(468, 632, 848, 456, '大屏端 · 开奖画面')}
  ${imageFrame(source.bigcj, 492, 710, 800, 344, 16)}
  <rect x="500" y="970" width="300" height="64" rx="32" fill="#102d57" stroke="#ffd166"/><text x="650" y="1012" text-anchor="middle" fill="#ffe29b" font-size="25" class="bold">奖项与抽取人数可设置</text>
  ${chip('微信扫码抽奖', 162, 1200, 330)}${chip('大屏点击抽奖', 555, 1200, 330, palette.gold)}${chip('券号抽奖', 948, 1200, 330, palette.violet)}
  <text x="720" y="1338" text-anchor="middle" fill="#91acd4" font-size="23">三种参与方式来自系统现有抽奖配置，可按活动流程选择</text>
`);

save('03-list-proof-1440.svg', `
  ${header('真实名单流程', '导入名单抽奖', '已有员工、嘉宾或客户名单，无需先做微信签到')}
  ${glassPanel(70, 364, 670, 716)}
  <text x="112" y="424" fill="${palette.white}" font-size="32" class="heavy">Excel 名单模板</text>
  <text x="112" y="462" fill="${palette.muted}" font-size="23">姓名、部门、号码、分组等字段按活动准备</text>
  ${spreadsheet(108, 510, 594, 410)}
  <rect x="158" y="956" width="494" height="78" rx="39" fill="#347dff"/>
  <text x="405" y="1007" text-anchor="middle" fill="#fff" font-size="29" class="heavy">上传名单并检查数据</text>
  ${browserChrome(792, 364, 576, 716, '大屏端 · 导入名单抽奖')}
  ${imageFrame(source.importcj, 820, 450, 520, 308, 18)}
  <rect x="824" y="794" width="512" height="238" rx="24" fill="#0c2b58"/>
  <text x="862" y="850" fill="#fff" font-size="28" class="heavy">抽奖前可配置</text>
  <circle cx="874" cy="900" r="7" fill="#4dd7ff"/><text x="898" y="910" fill="#c8d9f2" font-size="23">奖项与奖品信息</text>
  <circle cx="874" cy="946" r="7" fill="#4dd7ff"/><text x="898" y="956" fill="#c8d9f2" font-size="23">一次抽取数量</text>
  <circle cx="874" cy="992" r="7" fill="#4dd7ff"/><text x="898" y="1002" fill="#c8d9f2" font-size="23">分组数据与抽奖轮次</text>
  ${chip('Excel名单导入', 92, 1138, 360)}${chip('奖项轮次设置', 540, 1138, 360)}${chip('大屏现场抽取', 988, 1138, 360)}
  <text x="720" y="1338" text-anchor="middle" fill="#91acd4" font-size="24">适用：公司员工抽奖 · 嘉宾名单抽奖 · 客户号码抽奖</text>
`);

save('04-list-flow-1440.svg', `
  ${header('名单型活动', '从文件到开奖', '把准备、核对、设置、抽取四个环节放在同一张主图里')}
  ${flowStep(1, '下载模板', '按字段整理名单', 72, 376, 286)}
  ${flowStep(2, '导入数据', '上传后检查内容', 407, 376, 286)}
  ${flowStep(3, '设置奖项', '配置轮次与人数', 742, 376, 286)}
  ${flowStep(4, '现场抽取', '空格键开始停止', 1077, 376, 286)}
  ${glassPanel(72, 586, 1296, 580)}
  ${spreadsheet(112, 628, 550, 386)}
  <path d="M698 820H760" stroke="#4dd7ff" stroke-width="6" stroke-dasharray="12 12"/>
  <polygon points="760,804 792,820 760,836" fill="#4dd7ff"/>
  ${browserChrome(802, 626, 526, 432, '现场大屏 · 名单抽奖')}
  ${imageFrame(source.importcj, 826, 702, 478, 286, 14)}
  <rect x="846" y="936" width="438" height="76" rx="38" fill="#ffcf62"/><text x="1065" y="987" text-anchor="middle" fill="#31210a" font-size="30" class="heavy">开始抽奖 / 停止抽奖</text>
  <rect x="130" y="1044" width="1140" height="78" rx="24" fill="#0d2c58" stroke="#73b5ff" stroke-opacity=".36"/>
  <text x="700" y="1094" text-anchor="middle" fill="#d9e8ff" font-size="25" class="bold">名单数据、奖项、每轮人数与中奖结果在同一活动中管理</text>
  ${chip('员工', 250, 1218, 250)}${chip('嘉宾', 595, 1218, 250)}${chip('客户', 940, 1218, 250)}
`);

save('05-games-matrix-1440.svg', `
  ${header('多玩法矩阵', '大屏互动游戏', '用真实功能预览展示玩法，不再只堆“年会互动”几个字')}
  ${imageFrame(source.shake, 72, 382, 610, 352, 24)}
  <rect x="92" y="650" width="268" height="62" rx="31" fill="#0d2a52" stroke="#4dd7ff"/><text x="226" y="692" text-anchor="middle" fill="#fff" font-size="28" class="heavy">摇一摇竞速</text>
  ${imageFrame(source.horse, 758, 382, 610, 352, 24)}
  <rect x="778" y="650" width="268" height="62" rx="31" fill="#0d2a52" stroke="#ffd166"/><text x="912" y="692" text-anchor="middle" fill="#fff" font-size="28" class="heavy">赛马互动</text>
  ${imageFrame(source.hbwall, 72, 792, 610, 352, 24)}
  <rect x="92" y="1060" width="268" height="62" rx="31" fill="#0d2a52" stroke="#ff8f70"/><text x="226" y="1102" text-anchor="middle" fill="#fff" font-size="28" class="heavy">红包互动</text>
  ${imageFrame(source.lottery, 758, 792, 610, 352, 24)}
  <rect x="778" y="1060" width="268" height="62" rx="31" fill="#0d2a52" stroke="#a78bfa"/><text x="912" y="1102" text-anchor="middle" fill="#fff" font-size="28" class="heavy">3D抽奖</text>
  ${chip('企业年会', 162, 1216, 330)}${chip('团队暖场', 555, 1216, 330)}${chip('现场竞技', 948, 1216, 330)}
`);

save('06-games-live-1440.svg', `
  ${header('现场联动', '手机摇 · 大屏赛', '手机参与端负责互动，大屏端负责进度与排名展示')}
  ${browserChrome(72, 376, 850, 700, '大屏端 · 摇一摇互动')}
  ${imageFrame(source.shake, 96, 454, 802, 438, 18)}
  <rect x="114" y="928" width="768" height="112" rx="24" fill="#0c2b58"/>
  <text x="152" y="978" fill="#fff" font-size="31" class="heavy">多人同屏竞速与排行榜</text>
  <text x="152" y="1018" fill="#bfd1ed" font-size="23">手机动作实时进入赛道，现场大屏展示进度</text>
  ${phoneFrame(980, 366, 360, 710, `
    <rect x="1012" y="418" width="296" height="116" rx="24" fill="#e6efff"/><text x="1160" y="463" text-anchor="middle" fill="#294c78" font-size="25" class="bold">手机互动端</text><text x="1160" y="500" text-anchor="middle" fill="#667d9d" font-size="20">进入活动后摇动手机</text>
    <circle cx="1160" cy="688" r="112" fill="#327cff" opacity=".13"/>
    <g transform="translate(1094 598) rotate(-12 66 116)"><rect x="16" y="0" width="100" height="214" rx="24" fill="#1c2d49"/><rect x="26" y="20" width="80" height="170" rx="16" fill="#e9f2ff"/><circle cx="66" cy="203" r="6" fill="#8ba5c8"/></g>
    <path d="M1052 628c-28 40-28 92 0 132 M1268 628c28 40 28 92 0 132" fill="none" stroke="#6d8fff" stroke-width="12" stroke-linecap="round"/>
    <rect x="1024" y="866" width="272" height="72" rx="36" fill="#397dff"/><text x="1160" y="914" text-anchor="middle" fill="#fff" font-size="28" class="heavy">开始摇一摇</text>
    <text x="1160" y="996" text-anchor="middle" fill="#59708f" font-size="22">大屏同步显示赛况</text>`)}
  ${chip('摇一摇', 112, 1158, 260)}${chip('赛马', 430, 1158, 260, palette.gold)}${chip('红包雨', 748, 1158, 260, '#ff8d74')}${chip('互动抽奖', 1066, 1158, 260, palette.violet)}
  <text x="720" y="1342" text-anchor="middle" fill="#91acd4" font-size="23">同一套活动系统拆分不同玩法入口，覆盖年会暖场与互动需求</text>
`);

const manifest = {
  version: 1,
  campaign: 'taobao-rapid-listing-20260805',
  products,
  sourceFacts: [
    '微信扫码抽奖、大屏点击抽奖、券号抽奖来自 configdzp/editrotate.html',
    'Excel 导入名单来自 configlabaji/data.html 与 configyaohao/user.html 的 importxls 流程',
    '一次抽取数量、轮次抽奖、分组数据来自 importcj 配置与大屏模板',
    '摇一摇、赛马、红包墙、3D 抽奖使用项目内真实功能预览图',
  ],
  provenance: 'Project-owned real preview assets plus deterministic SVG interface diagrams and Chinese copy. No generative model used for final pixels.',
};
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({svgDir, files: fs.readdirSync(svgDir), manifest: path.join(root, 'manifest.json')}, null, 2));
