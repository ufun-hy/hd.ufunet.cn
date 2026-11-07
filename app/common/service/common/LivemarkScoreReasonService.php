<?php

namespace app\common\service\common;

use support\Log;
use think\facade\Db;

final class LivemarkScoreReasonService
{
    public static function get(int $huodongId, int $pfuserId): string
    {
        if ($huodongId <= 0 || $pfuserId <= 0) {
            return '';
        }

        try {
            $table = self::table();
            $rows = Db::query(
                "SELECT `score_reason` FROM `{$table}` WHERE `id` = ? AND `huodong_id` = ? LIMIT 1",
                [$pfuserId, $huodongId]
            );
            return (string) ($rows[0]['score_reason'] ?? '');
        } catch (\Throwable $exception) {
            Log::error(sprintf('Unable to read score reason for participant %d: %s', $pfuserId, $exception->getMessage()));
            return '';
        }
    }

    public static function save(int $huodongId, int $pfuserId, string $reason): void
    {
        if ($huodongId <= 0 || $pfuserId <= 0) {
            throw new \InvalidArgumentException('Invalid livemark participant');
        }

        $table = self::table();
        Db::execute(
            "UPDATE `{$table}` SET `score_reason` = ? WHERE `id` = ? AND `huodong_id` = ?",
            [$reason, $pfuserId, $huodongId]
        );
        $rows = Db::query(
            "SELECT `score_reason` FROM `{$table}` WHERE `id` = ? AND `huodong_id` = ? LIMIT 1",
            [$pfuserId, $huodongId]
        );
        if (!isset($rows[0]) || (string) $rows[0]['score_reason'] !== $reason) {
            throw new \RuntimeException('Score reason was not saved');
        }
    }

    private static function table(): string
    {
        $connection = (string) config('thinkorm.default', 'mysql');
        $prefix = (string) config("thinkorm.connections.{$connection}.prefix", '');
        $table = $prefix . 'huodong_livemarkuser';
        if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) {
            throw new \RuntimeException('Invalid livemark participant table name');
        }
        return $table;
    }
}
