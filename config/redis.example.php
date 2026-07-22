<?php

$password = getenv('REDIS_PASSWORD');
if ($password === false || $password === '' || $password === 'null') {
    $password = null;
}

return [
    'default' => [
        'host' => getenv('REDIS_HOST') ?: '127.0.0.1',
        'password' => $password,
        'port' => (int) (getenv('REDIS_PORT') ?: 6379),
        'database' => 0,
    ],
];
