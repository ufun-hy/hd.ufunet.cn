<?php

declare(strict_types=1);

function runtime_path(string $path = ''): string
{
    return '/www/wwwroot/hd.ufunet.cn/runtime/' . ltrim($path, '/');
}

function connectDatabase(): PDO
{
    $config = require '/www/wwwroot/hd.ufunet.cn/config/thinkorm.php';
    $connection = $config['connections'][$config['default']];

    return new PDO(
        sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $connection['hostname'],
            $connection['hostport'],
            $connection['database'],
            $connection['charset']
        ),
        $connection['username'],
        $connection['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
}

function fetchRows(PDO $pdo, string $table, int $activityId, int $roundId): array
{
    $statement = $pdo->prepare(
        "SELECT * FROM `{$table}` WHERE huodong_id = ? AND rotate_id = ? ORDER BY id"
    );
    $statement->execute([$activityId, $roundId]);

    return $statement->fetchAll(PDO::FETCH_ASSOC);
}

function fingerprint(array $rows): string
{
    return hash('sha256', json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function writeJson(string $path, array $data): void
{
    $json = json_encode(
        $data,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
    );
    if ($json === false || file_put_contents($path, $json . PHP_EOL, LOCK_EX) === false) {
        throw new RuntimeException("Unable to write backup file: {$path}");
    }
    chmod($path, 0600);
}

function createAwardInsert(PDO $pdo, bool $includeId): PDOStatement
{
    $columns = [
        'huodong_id', 'displayorder', 'rotate_id', 'prizetype', 'prizename',
        'prizeimg', 'prizemoney', 'prizenum', 'create_time', 'opened',
        'prizetitle', 'prizediy', 'prizefrontbg', 'prizebackbg',
    ];
    if ($includeId) {
        array_unshift($columns, 'id');
    }
    $quotedColumns = array_map(static function (string $column): string {
        return "`{$column}`";
    }, $columns);
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));

    return $pdo->prepare(
        'INSERT INTO `mibov3_huodong_hbwall_award` ('
        . implode(', ', $quotedColumns)
        . ") VALUES ({$placeholders})"
    );
}

function restoreAwards(PDO $pdo, array $rows): void
{
    $insert = createAwardInsert($pdo, true);
    foreach ($rows as $row) {
        $insert->execute([
            $row['id'], $row['huodong_id'], $row['displayorder'], $row['rotate_id'],
            $row['prizetype'], $row['prizename'], $row['prizeimg'], $row['prizemoney'],
            $row['prizenum'], $row['create_time'], $row['opened'], $row['prizetitle'],
            $row['prizediy'], $row['prizefrontbg'], $row['prizebackbg'],
        ]);
    }
}

$activityId = 797;
$roundId = 52;
$awardTable = 'mibov3_huodong_hbwall_award';
$deployId = $argv[1] ?? '';
$backupDirectory = $argv[2] ?? '';

if (!preg_match('/^hbwall-default-prizes-[0-9]{8}-[0-9]{6}$/', $deployId)) {
    fwrite(STDERR, "Invalid deploy id.\n");
    exit(2);
}
if ($backupDirectory === '' || !is_dir($backupDirectory)) {
    fwrite(STDERR, "Backup directory does not exist.\n");
    exit(2);
}

$prizeGroups = [
    [
        'title' => '特等奖',
        'name' => '智能运动手表',
        'image' => 'static/images/screen/hbwall-theme-v2/prizes/smart-watch.png',
        'quantity' => 3,
    ],
    [
        'title' => '一等奖',
        'name' => '蓝牙降噪耳机',
        'image' => 'static/images/screen/hbwall-theme-v2/prizes/wireless-earbuds.png',
        'quantity' => 5,
    ],
    [
        'title' => '二等奖',
        'name' => '智能保温杯',
        'image' => 'static/images/screen/hbwall-theme-v2/prizes/smart-tumbler.png',
        'quantity' => 7,
    ],
    [
        'title' => '三等奖',
        'name' => '精品咖啡礼盒',
        'image' => 'static/images/screen/hbwall-theme-v2/prizes/coffee-gift-box.png',
        'quantity' => 9,
    ],
];

$pdo = connectDatabase();

$roundStatement = $pdo->prepare(
    'SELECT id, huodong_id, title, isdefault, openmode '
    . 'FROM mibov3_huodong_hbwall_rotate WHERE id = ? AND huodong_id = ?'
);
$roundStatement->execute([$roundId, $activityId]);
$round = $roundStatement->fetch(PDO::FETCH_ASSOC);
if (!$round || (int) $round['isdefault'] !== 1) {
    fwrite(STDERR, "Target round is missing or is no longer the default round.\n");
    exit(3);
}

foreach ($prizeGroups as $group) {
    $assetPath = '/www/wwwroot/hd.ufunet.cn/public/' . $group['image'];
    if (!is_file($assetPath)) {
        fwrite(STDERR, "Missing deployed prize asset: {$group['image']}\n");
        exit(3);
    }
}

$relatedTables = [
    'mibov3_huodong_hbwall_lucker',
    'mibov3_huodong_hbwall_record',
    'mibov3_huodong_hbwall_plan',
];
$relatedRows = [];
foreach ($relatedTables as $table) {
    $relatedRows[$table] = fetchRows($pdo, $table, $activityId, $roundId);
    if (count($relatedRows[$table]) !== 0) {
        fwrite(STDERR, "Target round now has related draw data; replacement was aborted.\n");
        exit(4);
    }
}

$beforeRows = fetchRows($pdo, $awardTable, $activityId, $roundId);
if (!$beforeRows) {
    fwrite(STDERR, "Target round has no awards to replace.\n");
    exit(4);
}
$beforeFingerprint = fingerprint($beforeRows);

$backupPath = rtrim($backupDirectory, '/') . '/hbwall-awards-before.json';
writeJson($backupPath, [
    'deploy_id' => $deployId,
    'created_at' => date(DATE_ATOM),
    'activity_id' => $activityId,
    'round_id' => $roundId,
    'round' => $round,
    'award_table_engine' => 'MyISAM',
    'award_count' => count($beforeRows),
    'award_fingerprint' => $beforeFingerprint,
    'awards' => $beforeRows,
    'related_rows' => $relatedRows,
]);

$locked = false;
$mutated = false;
$restored = false;

try {
    $pdo->exec("LOCK TABLES `{$awardTable}` WRITE");
    $locked = true;

    $lockedRows = fetchRows($pdo, $awardTable, $activityId, $roundId);
    if (fingerprint($lockedRows) !== $beforeFingerprint) {
        throw new RuntimeException('Prize rows changed after backup; replacement was aborted.');
    }

    $delete = $pdo->prepare(
        "DELETE FROM `{$awardTable}` WHERE huodong_id = ? AND rotate_id = ?"
    );
    $delete->execute([$activityId, $roundId]);
    $mutated = true;

    $insert = createAwardInsert($pdo, false);
    $displayOrder = 1;
    $createdAt = time();
    foreach ($prizeGroups as $group) {
        for ($index = 0; $index < $group['quantity']; $index++) {
            $insert->execute([
                $activityId,
                $displayOrder,
                $roundId,
                1,
                $group['name'],
                $group['image'],
                '0.00',
                1,
                $createdAt,
                2,
                $group['title'],
                2,
                '',
                '',
            ]);
            $displayOrder++;
        }
    }

    $afterRows = fetchRows($pdo, $awardTable, $activityId, $roundId);
    if (count($afterRows) !== 24) {
        throw new RuntimeException('Replacement verification failed: expected 24 award rows.');
    }
    $expectedOrder = 1;
    foreach ($afterRows as $row) {
        if ((int) $row['displayorder'] !== $expectedOrder || (int) $row['opened'] !== 2) {
            throw new RuntimeException('Replacement verification failed: order or status mismatch.');
        }
        $expectedOrder++;
    }

    $pdo->exec('UNLOCK TABLES');
    $locked = false;

    writeJson(rtrim($backupDirectory, '/') . '/hbwall-awards-after.json', [
        'deploy_id' => $deployId,
        'created_at' => date(DATE_ATOM),
        'activity_id' => $activityId,
        'round_id' => $roundId,
        'award_count' => count($afterRows),
        'award_fingerprint' => fingerprint($afterRows),
        'awards' => $afterRows,
    ]);

    $summary = [];
    foreach ($prizeGroups as $group) {
        $summary[] = [
            'title' => $group['title'],
            'name' => $group['name'],
            'quantity' => $group['quantity'],
            'image' => $group['image'],
        ];
    }

    echo json_encode([
        'status' => 'success',
        'deploy_id' => $deployId,
        'activity_id' => $activityId,
        'round_id' => $roundId,
        'round_title' => $round['title'],
        'before_count' => count($beforeRows),
        'after_count' => count($afterRows),
        'backup' => $backupPath,
        'prizes' => $summary,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . PHP_EOL;
} catch (Throwable $error) {
    $restoreError = null;
    if ($locked && $mutated) {
        try {
            $delete = $pdo->prepare(
                "DELETE FROM `{$awardTable}` WHERE huodong_id = ? AND rotate_id = ?"
            );
            $delete->execute([$activityId, $roundId]);
            restoreAwards($pdo, $beforeRows);
            $restoredRows = fetchRows($pdo, $awardTable, $activityId, $roundId);
            if (fingerprint($restoredRows) !== $beforeFingerprint) {
                throw new RuntimeException('Restored rows do not match the backup fingerprint.');
            }
            $restored = true;
        } catch (Throwable $restoreFailure) {
            $restoreError = $restoreFailure->getMessage();
        }
    }
    if ($locked) {
        $pdo->exec('UNLOCK TABLES');
    }

    fwrite(STDERR, json_encode([
        'status' => 'failed',
        'error' => $error->getMessage(),
        'automatic_restore_completed' => $restored,
        'restore_error' => $restoreError,
        'backup' => $backupPath,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . PHP_EOL);
    exit(5);
}
