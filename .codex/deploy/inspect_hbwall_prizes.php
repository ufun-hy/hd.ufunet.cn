<?php

declare(strict_types=1);

function runtime_path(string $path = ''): string
{
    return '/www/wwwroot/hd.ufunet.cn/runtime/' . ltrim($path, '/');
}

$config = require '/www/wwwroot/hd.ufunet.cn/config/thinkorm.php';
$connection = $config['connections'][$config['default']];
$pdo = new PDO(
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

$activityId = 797;
$roundId = 52;
$tables = [
    'mibov3_huodong_hbwall_award',
    'mibov3_huodong_hbwall_lucker',
    'mibov3_huodong_hbwall_record',
    'mibov3_huodong_hbwall_plan',
];
$output = [];

foreach ($tables as $table) {
    $columns = $pdo->query("SHOW COLUMNS FROM `{$table}`")->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'Field');
    $where = [];
    $params = [];

    if (in_array('huodong_id', $columnNames, true)) {
        $where[] = 'huodong_id = ?';
        $params[] = $activityId;
    }
    if (in_array('rotate_id', $columnNames, true)) {
        $where[] = 'rotate_id = ?';
        $params[] = $roundId;
    }

    if (!$where) {
        $output[$table] = ['columns' => $columnNames, 'count' => null];
        continue;
    }

    $statement = $pdo->prepare(
        "SELECT COUNT(*) FROM `{$table}` WHERE " . implode(' AND ', $where)
    );
    $statement->execute($params);
    $output[$table] = [
        'columns' => $columnNames,
        'count' => (int) $statement->fetchColumn(),
    ];
}

$statement = $pdo->prepare(
    'SELECT opened, COUNT(*) AS count, MIN(displayorder) AS min_order, '
    . 'MAX(displayorder) AS max_order '
    . 'FROM mibov3_huodong_hbwall_award '
    . 'WHERE huodong_id = ? AND rotate_id = ? '
    . 'GROUP BY opened ORDER BY opened'
);
$statement->execute([$activityId, $roundId]);
$output['award_status'] = $statement->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($output, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
