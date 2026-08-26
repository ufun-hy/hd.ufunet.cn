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

function fetchAwards(PDO $pdo, int $activityId, int $roundId): array
{
    $statement = $pdo->prepare(
        'SELECT * FROM mibov3_huodong_hbwall_award '
        . 'WHERE huodong_id = ? AND rotate_id = ? ORDER BY id'
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
        throw new RuntimeException("Unable to write backup: {$path}");
    }
    chmod($path, 0600);
}

function prizeKey(array $row): string
{
    return $row['prizetitle'] . '|' . $row['prizename'] . '|' . $row['prizeimg'];
}

$activityId = 797;
$roundId = 52;
$table = 'mibov3_huodong_hbwall_award';
$deployId = $argv[1] ?? '';
$backupDirectory = $argv[2] ?? '';

if (!preg_match('/^hbwall-demo-prizes-expand-[0-9]{8}-[0-9]{6}$/', $deployId)) {
    fwrite(STDERR, "Invalid deploy id.\n");
    exit(2);
}
if ($backupDirectory === '' || !is_dir($backupDirectory)) {
    fwrite(STDERR, "Backup directory does not exist.\n");
    exit(2);
}

$groups = [
    [
        'title' => '特等奖',
        'name' => '智能运动手表',
        'image' => 'static/images/screen/hbwall-theme-v2/prizes/smart-watch.png',
        'target' => 5,
    ],
    [
        'title' => '一等奖',
        'name' => '蓝牙降噪耳机',
        'image' => 'static/images/screen/hbwall-theme-v2/prizes/wireless-earbuds.png',
        'target' => 12,
    ],
    [
        'title' => '二等奖',
        'name' => '智能保温杯',
        'image' => 'static/images/screen/hbwall-theme-v2/prizes/smart-tumbler.png',
        'target' => 18,
    ],
    [
        'title' => '三等奖',
        'name' => '精品咖啡礼盒',
        'image' => 'static/images/screen/hbwall-theme-v2/prizes/coffee-gift-box.png',
        'target' => 25,
    ],
];

$pdo = connectDatabase();
$beforeRows = fetchAwards($pdo, $activityId, $roundId);
$beforeFingerprint = fingerprint($beforeRows);

$knownGroups = [];
foreach ($groups as $group) {
    $knownGroups[$group['title'] . '|' . $group['name'] . '|' . $group['image']] = $group;
}
$beforeCounts = [];
foreach ($beforeRows as $row) {
    $key = prizeKey($row);
    if (!isset($knownGroups[$key])) {
        fwrite(STDERR, "Unexpected prize exists in the target round; expansion aborted.\n");
        exit(3);
    }
    $beforeCounts[$key] = ($beforeCounts[$key] ?? 0) + 1;
}

writeJson(rtrim($backupDirectory, '/') . '/hbwall-awards-before.json', [
    'deploy_id' => $deployId,
    'created_at' => date(DATE_ATOM),
    'activity_id' => $activityId,
    'round_id' => $roundId,
    'award_count' => count($beforeRows),
    'award_fingerprint' => $beforeFingerprint,
    'awards' => $beforeRows,
]);

$locked = false;
$insertedIds = [];

try {
    $pdo->exec("LOCK TABLES `{$table}` WRITE");
    $locked = true;

    $lockedRows = fetchAwards($pdo, $activityId, $roundId);
    if (fingerprint($lockedRows) !== $beforeFingerprint) {
        throw new RuntimeException('Prize rows changed after backup; expansion aborted.');
    }

    $counts = [];
    $maxDisplayOrder = 0;
    foreach ($lockedRows as $row) {
        $key = prizeKey($row);
        $counts[$key] = ($counts[$key] ?? 0) + 1;
        $maxDisplayOrder = max($maxDisplayOrder, (int) $row['displayorder']);
    }

    $insert = $pdo->prepare(
        'INSERT INTO mibov3_huodong_hbwall_award '
        . '(huodong_id, displayorder, rotate_id, prizetype, prizename, prizeimg, '
        . 'prizemoney, prizenum, create_time, opened, prizetitle, prizediy, '
        . 'prizefrontbg, prizebackbg) '
        . 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $createdAt = time();

    foreach ($groups as $group) {
        $key = $group['title'] . '|' . $group['name'] . '|' . $group['image'];
        $current = $counts[$key] ?? 0;
        if ($current > $group['target']) {
            throw new RuntimeException("Current prize count exceeds target for {$group['name']}.");
        }
        for ($index = $current; $index < $group['target']; $index++) {
            $maxDisplayOrder++;
            $insert->execute([
                $activityId,
                $maxDisplayOrder,
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
            $insertedIds[] = (int) $pdo->lastInsertId();
        }
    }

    $afterRows = fetchAwards($pdo, $activityId, $roundId);
    if (count($afterRows) !== 60) {
        throw new RuntimeException('Expected 60 awards after expansion.');
    }

    $afterCounts = [];
    foreach ($afterRows as $row) {
        $key = prizeKey($row);
        $afterCounts[$key] = ($afterCounts[$key] ?? 0) + 1;
    }
    foreach ($groups as $group) {
        $key = $group['title'] . '|' . $group['name'] . '|' . $group['image'];
        if (($afterCounts[$key] ?? 0) !== $group['target']) {
            throw new RuntimeException("Quantity verification failed for {$group['name']}.");
        }
    }

    $afterById = [];
    foreach ($afterRows as $row) {
        $afterById[(int) $row['id']] = $row;
    }
    foreach ($beforeRows as $row) {
        if (!isset($afterById[(int) $row['id']]) || $afterById[(int) $row['id']] !== $row) {
            throw new RuntimeException('An existing prize row changed during expansion.');
        }
    }

    $pdo->exec('UNLOCK TABLES');
    $locked = false;

    writeJson(rtrim($backupDirectory, '/') . '/hbwall-awards-after.json', [
        'deploy_id' => $deployId,
        'created_at' => date(DATE_ATOM),
        'activity_id' => $activityId,
        'round_id' => $roundId,
        'award_count' => count($afterRows),
        'inserted_ids' => $insertedIds,
        'awards' => $afterRows,
    ]);

    echo json_encode([
        'status' => 'success',
        'before_count' => count($beforeRows),
        'after_count' => count($afterRows),
        'inserted_count' => count($insertedIds),
        'inserted_ids' => $insertedIds,
        'targets' => array_map(static function (array $group): array {
            return ['name' => $group['name'], 'quantity' => $group['target']];
        }, $groups),
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
} catch (Throwable $error) {
    $rollbackError = null;
    if ($locked && $insertedIds) {
        try {
            $delete = $pdo->prepare("DELETE FROM `{$table}` WHERE id = ?");
            foreach ($insertedIds as $id) {
                $delete->execute([$id]);
            }
            if (fingerprint(fetchAwards($pdo, $activityId, $roundId)) !== $beforeFingerprint) {
                throw new RuntimeException('Rollback fingerprint mismatch.');
            }
        } catch (Throwable $rollbackFailure) {
            $rollbackError = $rollbackFailure->getMessage();
        }
    }
    if ($locked) {
        $pdo->exec('UNLOCK TABLES');
    }

    fwrite(STDERR, json_encode([
        'status' => 'failed',
        'error' => $error->getMessage(),
        'rollback_error' => $rollbackError,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL);
    exit(4);
}
