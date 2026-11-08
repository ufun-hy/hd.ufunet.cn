<?php
// 主持人亮分开关：迁移、服务读写与保存中间件。运行方式见 tests/livemark-offsite/README.md，脚本换成本文件。
require __DIR__ . '/../livemark-offsite/stubs.php';
require '/app/app/common/service/common/LivemarkRevealScoreService.php';
require '/app/app/middleware/LivemarkRevealScoreMiddleware.php';

use app\common\service\common\LivemarkRevealScoreService as S;
use app\middleware\LivemarkRevealScoreMiddleware;
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
$pdo->exec('DROP TABLE IF EXISTS mibov3_huodong_configlivemark');
// 只建迁移依赖的列（showdecscore 由 20260905 迁移加入）。
$pdo->exec('CREATE TABLE mibov3_huodong_configlivemark (id INT AUTO_INCREMENT PRIMARY KEY, huodong_id INT NOT NULL, showdecscore TINYINT(1) NOT NULL DEFAULT 1)');
$pdo->exec('INSERT INTO mibov3_huodong_configlivemark (huodong_id) VALUES (100), (200)');
$pdo->exec(preg_replace('/^--.*$/m', '', file_get_contents('/app/database/migrations/20261108_add_revealscore_to_livemark_config.sql')));

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
function save(string $method, string $path, array $post, $hd = 100, int $code = 0): array
{
    $req = new Request($method, $path, $post, $hd);
    $res = (new LivemarkRevealScoreMiddleware())->process($req, function () use ($code) {
        return new Response(200, [], json_encode(['code' => $code, 'msg' => 'legacy'], JSON_UNESCAPED_UNICODE));
    });

    return json_decode($res->rawBody(), true);
}

echo "迁移与默认值\n";
check('迁移后现有活动默认关闭', S::get(100), 2);
check('活动不存在时返回默认值', S::get(999), 2);
check('活动 id 无效时返回默认值', S::get(0), 2);

echo "保存\n";
check('后台保存开启', save('POST', '/hdmanage/configlivemark/index', ['revealscore' => '1'])['code'], 0);
check('读取到开启', S::get(100), 1);
check('不影响其他活动', S::get(200), 2);
check('web 端保存关闭', save('POST', '/web/hdconfig/livemark', ['revealscore' => '2'])['code'], 0);
check('读取到关闭', S::get(100), 2);
save('POST', '/hdmanage/configlivemark/index', ['revealscore' => '1'], 100, -1);
check('原版保存失败时不写入', S::get(100), 2);
save('POST', '/hdmanage/configlivemark/index', ['revealscore' => '3']);
check('非法取值不写入', S::get(100), 2);
save('GET', '/hdmanage/configlivemark/index', ['revealscore' => '1']);
check('GET 请求不写入', S::get(100), 2);
save('POST', '/hdmanage/configlivemark/editrotate', ['revealscore' => '1']);
check('其他路径不写入', S::get(100), 2);
check('无法识别活动时提示未保存', save('POST', '/hdmanage/configlivemark/index', ['revealscore' => '1'], null)['code'], -1);
check('未提交该字段时原样返回', save('POST', '/hdmanage/configlivemark/index', [])['msg'], 'legacy');

$pdo->exec('UPDATE mibov3_huodong_configlivemark SET revealscore = 9 WHERE huodong_id = 200');
check('库中异常值按默认处理', S::get(200), 2);

echo "\n{$pass} passed, {$fail} failed\n";
exit($fail ? 1 : 0);
