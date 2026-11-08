<?php
require __DIR__ . '/stubs.php';
require '/app/app/common/service/common/LivemarkOffsiteScoreService.php';
require '/app/app/middleware/LivemarkOffsiteScoreSaveMiddleware.php';
require '/app/app/middleware/LivemarkOffsiteScoreResponseMiddleware.php';

use app\common\service\common\LivemarkOffsiteScoreService as S;
use app\middleware\LivemarkOffsiteScoreResponseMiddleware;
use app\middleware\LivemarkOffsiteScoreSaveMiddleware;
use think\facade\Db;
use Webman\Http\Request;
use Webman\Http\Response;

$pdo = null;
for ($i = 0; $i < 60 && !$pdo; $i++) {
    try {
        $pdo = new PDO('mysql:host=lmtest-mysql;dbname=hd;charset=utf8mb4', 'root', 'test', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    } catch (Throwable $e) {
        sleep(2);
    }
}
Db::$pdo = $pdo;
$pdo->exec('DROP TABLE IF EXISTS mibov3_huodong_livemark_offsite_rotate, mibov3_huodong_livemark_offsite_score, mibov3_huodong_rotatelivemarkuser');
foreach (array_filter(array_map('trim', explode(';', preg_replace('/^--.*$/m', '', file_get_contents('/app/database/migrations/20261108_create_livemark_offsite_score_tables.sql'))))) as $sql) {
    $pdo->exec($sql);
}
$pdo->exec('CREATE TABLE mibov3_huodong_rotatelivemarkuser (id INT PRIMARY KEY, basicscore DECIMAL(10,2) NOT NULL DEFAULT 0)');
$pdo->exec("INSERT INTO mibov3_huodong_rotatelivemarkuser VALUES (7072, 30.12), (7073, 0), (7074, 0)");

$fail = 0;
$pass = 0;
function check(string $name, $actual, $expected): void
{
    global $fail, $pass;
    if ($actual === $expected) {
        $pass++;
        echo "  ok   {$name}\n";
    } else {
        $fail++;
        echo "  FAIL {$name}\n       expected: " . var_export($expected, true) . "\n       actual:   " . var_export($actual, true) . "\n";
    }
}
function json(array $data): Response
{
    return new Response(200, [], json_encode($data, JSON_UNESCAPED_UNICODE));
}
function save(array $post, $hd = 100, int $code = 0, &$called = null): array
{
    $called = false;
    $req = new Request('POST', '/hdmanage/configlivemark/saverotate', $post, $hd);
    $GLOBALS['__request'] = $req;
    $res = (new LivemarkOffsiteScoreSaveMiddleware())->process($req, function () use (&$called, $code) {
        $called = true;

        return json(['code' => $code, 'msg' => 'legacy']);
    });

    return json_decode($res->rawBody(), true);
}
function respond(string $path, array $payload, $hd = 100): array
{
    $req = new Request('POST', $path, [], $hd);
    $GLOBALS['__request'] = $req;
    $res = (new LivemarkOffsiteScoreResponseMiddleware())->process($req, fn () => json($payload));

    return json_decode($res->rawBody(), true);
}
$count = fn () => (int) $pdo->query('SELECT COUNT(*) FROM mibov3_huodong_livemark_offsite_score')->fetchColumn();

$valid = ['rotateid' => '5', 'offsiteopen' => '1', 'offsiteweight' => '40', 'offsitename' => '网络投票<b>', 'offsitescore_7072' => '90', 'offsitescore_7073' => '10', 'offsitescore_7074' => ''];

echo "保存校验\n";
$r = save(array_merge($valid, ['offsiteweight' => '150']), 100, 0, $called);
check('占比 150 被拒绝', $r['code'], -1);
check('校验失败时不调用原版保存', $called, false);
check('启用但占比为 0 被拒绝', save(array_merge($valid, ['offsiteweight' => '0']))['code'], -1);
check('负数场外分被拒绝', save(array_merge($valid, ['offsitescore_7072' => '-1']))['code'], -1);
check('非数字场外分被拒绝', save(array_merge($valid, ['offsitescore_7072' => 'abc']))['code'], -1);
$r = save($valid, 100, -1);
check('原版保存失败时透传原响应', $r['msg'], 'legacy');
check('原版保存失败时不写场外分', $count(), 0);
$r = save(['rotateid' => '5', 'title' => 'x'], 100, 0, $called);
check('没有场外字段（新建轮次）时原样放行', [$r['code'], $called], [0, true]);

echo "保存成功\n";
check('有效保存返回原版成功', save($valid)['code'], 0);
check('写入 3 个选手', $count(), 3);
$editor = S::editorData(5);
check('编辑页读取配置', [$editor['open'], $editor['weight'], $editor['title']], [1, 40, '网络投票']);
check('编辑页读取分数（空值存为 0）', $editor['scores'], [7072 => '90.00', 7073 => '10.00', 7074 => '0.00']);
check('其他活动不能改写本轮次', save(array_merge($valid, ['offsiteweight' => '99']), 200)['code'], -1);
check('其他活动改写后配置不变', S::editorData(5)['weight'], 40);

echo "大屏选手详情 getuserdata（样本 7072：score=17.00，score2=47.12，调整分 +30.12）\n";
$r = respond('/screen/livemark/getuserdata', ['code' => 0, 'msg' => ['id' => 7072, 'score' => '17.00', 'score2' => '47.12', 'basicscore' => '30.12']]);
check('score = 17×60% + 90×40% = 46.20', $r['msg']['score'], '46.20');
check('score2 = 46.20 + 30.12 = 76.32', $r['msg']['score2'], '76.32');
check('offsite 明细', $r['msg']['offsite'], ['title' => '网络投票', 'weight' => 40, 'score' => '90.00', 'onsite' => '17.00']);
$r = respond('/screen/livemark/getuserdata', ['code' => 0, 'msg' => ['id' => 7072, 'score' => '17.00', 'score2' => '47.12', 'basicscore' => '30.12']], 200);
check('其他活动的大屏不受影响', [$r['msg']['score2'], isset($r['msg']['offsite'])], ['47.12', false]);
$r = respond('/screen/livemark/getuserdata', ['code' => 0, 'msg' => ['id' => 7073, 'score' => '60.00', 'basicscore' => '0']]);
check('无 score2、无调整分：60×60% + 10×40% = 40.00', $r['msg']['score'], '40.00');
$r = respond('/screen/livemark/getuserdata', ['code' => 0, 'msg' => ['id' => 7074, 'score' => false, 'basicscore' => '0']]);
check('未评分保持 false，仍带场外明细', [$r['msg']['score'], $r['msg']['offsite']['onsite'], $r['msg']['offsite']['score']], [false, false, '0.00']);

echo "大屏排行榜 getscoredata\n";
$r = respond('/screen/livemark/getscoredata', ['code' => 0, 'msg' => ['title' => 't', 'pfusers' => [
    ['id' => 7073, 'score' => '60.00', 'basicscore' => '0'],
    ['id' => 7074, 'score' => false],
    ['id' => 7072, 'score' => '47.12'],
]]]);
check('重新排序（未评分排最后）', array_column($r['msg']['pfusers'], 'id'), [7072, 7073, 7074]);
check('排行分数（7072 从库读调整分）', array_column($r['msg']['pfusers'], 'score'), ['76.32', '40.00', false]);
$r = respond('/screen/livemark/getscoredata', ['code' => 0, 'msg' => ['pfusers' => [['id' => 7073, 'score' => '60', 'basicscore' => '0']]]]);
check('整数分保持整数：60 → 40', $r['msg']['pfusers'][0]['score'], '40');

echo "后台数据列表 datalivemark/index\n";
$r = respond('/hdmanage/datalivemark/index', ['total' => 2, 'rows' => [
    ['id' => 7073, 'scoredata' => ['score' => '60.00']],
    ['id' => 7072, 'scoredata' => ['score' => '47.12', 'score_pw' => '17.00']],
]]);
check('不改变顺序', array_column($r['rows'], 'id'), [7073, 7072]);
check('列表最终分', [$r['rows'][0]['scoredata']['score'], $r['rows'][1]['scoredata']['score']], ['40.00', '76.32']);
check('保留原字段', $r['rows'][1]['scoredata']['score_pw'], '17.00');
check('列表场内分', $r['rows'][1]['scoredata']['offsite']['onsite'], '17.00');

echo "微信模板\n";
$GLOBALS['__request'] = new Request('GET', '/wechat/livemark/scorephb', [], 100);
$list = S::applyToTemplateList([['id' => 7073, 'score' => '60.00'], ['id' => 7072, 'score' => '47.12']]);
check('排行榜重算并重排', array_column($list, 'score'), ['76.32', '40.00']);
check('单个选手不重排', S::applyToTemplateUser(['id' => 7072, 'score' => '47.12'])['score'], '76.32');
check('非数组原样返回', S::applyToTemplateList(null), null);

echo "不应改动的情况\n";
$r = respond('/screen/livemark/getnormaldata', ['code' => 0, 'msg' => ['pfusers' => [['id' => 7072, 'score' => '47.12']]]]);
check('其他接口不改', $r['msg']['pfusers'][0]['score'], '47.12');
$req = new Request('GET', '/hdmanage/datalivemark/index', [], 100);
$res = (new LivemarkOffsiteScoreResponseMiddleware())->process($req, fn () => new Response(200, [], '<html>page</html>'));
check('HTML 页面不改', $res->rawBody(), '<html>page</html>');
$r = respond('/screen/livemark/getuserdata', ['code' => -1, 'msg' => 'err']);
check('错误响应不改', $r['msg'], 'err');

$pdo->exec('RENAME TABLE mibov3_huodong_rotatelivemarkuser TO tmp_user');
$GLOBALS['__logs'] = [];
$r = respond('/screen/livemark/getscoredata', ['code' => 0, 'msg' => ['pfusers' => [['id' => 7072, 'score' => '47.12']]]]);
check('读不到调整分时保留原排行', $r['msg']['pfusers'][0]['score'], '47.12');
check('并记录日志', count($GLOBALS['__logs']) > 0, true);
$pdo->exec('RENAME TABLE tmp_user TO mibov3_huodong_rotatelivemarkuser');

check('关闭场外分数可保存', save(array_merge($valid, ['offsiteopen' => '2', 'offsiteweight' => '0']))['code'], 0);
$r = respond('/screen/livemark/getuserdata', ['code' => 0, 'msg' => ['id' => 7072, 'score' => '17.00', 'score2' => '47.12', 'basicscore' => '30.12']]);
check('关闭后恢复原分数', [$r['msg']['score2'], isset($r['msg']['offsite'])], ['47.12', false]);

echo "\n{$pass} passed, {$fail} failed\n";
exit($fail ? 1 : 0);
