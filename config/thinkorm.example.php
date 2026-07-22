<?php

$connection = getenv('DB_CONNECTION') ?: 'mysql';

return [
    'default' => $connection,
    'connections' => [
        $connection => [
            'type' => $connection,
            'hostname' => getenv('DB_HOST') ?: '127.0.0.1',
            'database' => getenv('DB_DATABASE') ?: 'test',
            'username' => getenv('DB_USERNAME') ?: 'root',
            'password' => getenv('DB_PASSWORD') ?: '',
            'hostport' => getenv('DB_PORT') ?: '3306',
            'params' => [],
            'charset' => 'utf8mb4',
            'prefix' => 'mibov3_',
            'break_reconnect' => true,
            'fields_cache' => true,
            'schema_cache_path' => runtime_path() . '/thinkorm/schema/',
        ],
    ],
];
