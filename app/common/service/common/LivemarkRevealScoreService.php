<?php

namespace app\common\service\common;

use support\Log;
use think\facade\Db;

final class LivemarkRevealScoreService
{
    public static function get($huodongId, int $default = 2): int
    {
        $huodongId = (int) $huodongId;
        if ($huodongId <= 0) {
            return $default;
        }

        try {
            $table = self::table();
            $rows = Db::query(
                "SELECT `revealscore` FROM `{$table}` WHERE `huodong_id` = ? LIMIT 1",
                [$huodongId]
            );
            $value = isset($rows[0]['revealscore']) ? (int) $rows[0]['revealscore'] : $default;

            return in_array($value, [1, 2], true) ? $value : $default;
        } catch (\Throwable $exception) {
            Log::error(sprintf(
                'Unable to read revealscore for activity %d: %s',
                $huodongId,
                $exception->getMessage()
            ));

            return $default;
        }
    }

    public static function save(int $huodongId, int $reveal): void
    {
        if ($huodongId <= 0 || !in_array($reveal, [1, 2], true)) {
            throw new \InvalidArgumentException('Invalid livemark reveal-score setting');
        }

        $table = self::table();
        Db::execute(
            "UPDATE `{$table}` SET `revealscore` = ? WHERE `huodong_id` = ?",
            [$reveal, $huodongId]
        );
    }

    private static function table(): string
    {
        $connection = (string) config('thinkorm.default', 'mysql');
        $prefix = (string) config("thinkorm.connections.{$connection}.prefix", '');
        $table = $prefix . 'huodong_configlivemark';

        if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) {
            throw new \RuntimeException('Invalid livemark config table name');
        }

        return $table;
    }
}
