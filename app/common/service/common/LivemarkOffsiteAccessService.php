<?php

namespace app\common\service\common;

use support\Log;
use think\facade\Db;

/**
 * Admin-only switch that enables the livemark off-site score for one activity.
 *
 * The encrypted hdinfo controller decides who is an admin and only exposes the
 * result to its view. The admin-only block of that view calls issueToken(),
 * which stores a one-off token in the session; the save middleware accepts the
 * switch only with that token, so a non-admin session can never change it.
 */
final class LivemarkOffsiteAccessService
{
    private const SESSION_KEY = 'livemark_offsite_access_tokens';

    public static function isOpen($huodongId): bool
    {
        $huodongId = (int) $huodongId;
        if ($huodongId <= 0) {
            return false;
        }

        try {
            $rows = Db::query(
                'SELECT `open` FROM `' . self::table() . '` WHERE `huodong_id` = ? LIMIT 1',
                [$huodongId]
            );

            return isset($rows[0]) && (int) $rows[0]['open'] === 1;
        } catch (\Throwable $exception) {
            Log::error(sprintf('Unable to read livemark offsite access for activity %d: %s', $huodongId, $exception->getMessage()));

            return false;
        }
    }

    public static function save(int $huodongId, int $open): void
    {
        if ($huodongId <= 0 || !in_array($open, [1, 2], true)) {
            throw new \InvalidArgumentException('Invalid livemark offsite access setting');
        }

        Db::execute(
            'INSERT INTO `' . self::table() . '` (`huodong_id`, `open`, `updated_at`) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE `open` = VALUES(`open`), `updated_at` = VALUES(`updated_at`)',
            [$huodongId, $open, time()]
        );
    }

    public static function issueToken($huodongId): string
    {
        $huodongId = (int) $huodongId;
        if ($huodongId <= 0) {
            return '';
        }

        // 同一会话复用令牌，管理员同时打开多个页面时都能保存。
        $session = request()->session();
        $tokens = (array) $session->get(self::SESSION_KEY, []);
        if (empty($tokens[$huodongId])) {
            $tokens[$huodongId] = bin2hex(random_bytes(16));
            $session->set(self::SESSION_KEY, $tokens);
        }

        return (string) $tokens[$huodongId];
    }

    public static function verifyToken($request, int $huodongId, string $token): bool
    {
        if ($huodongId <= 0 || $token === '') {
            return false;
        }

        $tokens = (array) $request->session()->get(self::SESSION_KEY, []);
        $expected = isset($tokens[$huodongId]) ? (string) $tokens[$huodongId] : '';

        return $expected !== '' && hash_equals($expected, $token);
    }

    private static function table(): string
    {
        $connection = (string) config('thinkorm.default', 'mysql');
        $prefix = (string) config("thinkorm.connections.{$connection}.prefix", '');
        $table = $prefix . 'huodong_livemark_offsite_access';

        if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) {
            throw new \RuntimeException('Invalid livemark offsite access table name');
        }

        return $table;
    }
}
