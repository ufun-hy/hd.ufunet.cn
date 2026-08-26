<?php

namespace app\common\service\common;

use support\Log;
use think\facade\Db;

/**
 * Reads and writes the livemark judge-score visibility independently of the
 * encrypted legacy model's fixed field list.
 */
final class LivemarkJudgeScoreVisibilityService
{
    public static function get($huodongId, int $default = 1): int
    {
        $huodongId = (int) $huodongId;
        if ($huodongId <= 0) {
            return $default;
        }

        try {
            $table = self::table();
            $rows = Db::query(
                "SELECT `showpwscore` FROM `{$table}` WHERE `huodong_id` = ? LIMIT 1",
                [$huodongId]
            );
            $value = isset($rows[0]['showpwscore']) ? (int) $rows[0]['showpwscore'] : $default;

            return in_array($value, [1, 2], true) ? $value : $default;
        } catch (\Throwable $exception) {
            Log::error(sprintf(
                'Unable to read showpwscore for activity %d: %s',
                $huodongId,
                $exception->getMessage()
            ));

            return $default;
        }
    }

    public static function save(int $huodongId, int $visibility): void
    {
        if ($huodongId <= 0 || !in_array($visibility, [1, 2], true)) {
            throw new \InvalidArgumentException('Invalid livemark judge-score visibility');
        }

        $table = self::table();
        Db::execute(
            "UPDATE `{$table}` SET `showpwscore` = ? WHERE `huodong_id` = ?",
            [$visibility, $huodongId]
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
