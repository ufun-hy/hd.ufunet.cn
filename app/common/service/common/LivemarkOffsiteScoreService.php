<?php

namespace app\common\service\common;

use support\Log;
use think\facade\Db;

/**
 * Combines the per-rotate off-site score with the on-site score computed by
 * the encrypted livemark core:
 *
 *   final = onsite × (100 − weight)% + offsite × weight% + basicscore
 *
 * The manual adjustment (basicscore) is added after weighting so that a
 * deduction is never diluted by the off-site weight.
 */
final class LivemarkOffsiteScoreService
{
    public const DEFAULT_TITLE = '场外分数';
    public const MAX_SCORE = 99999999.99;

    public static function requestHuodongId(): ?int
    {
        $value = request()->realhdid ?? null;

        return is_numeric($value) && (int) $value > 0 ? (int) $value : null;
    }

    /**
     * Server-rendered wechat pages pass the legacy arrays straight to the view.
     */
    public static function applyToTemplateList($users, bool $resort = true)
    {
        return is_array($users) ? self::applyToRanking($users, self::requestHuodongId(), $resort) : $users;
    }

    public static function applyToTemplateUser($user)
    {
        if (!is_array($user)) {
            return $user;
        }
        $users = self::applyToRanking([$user], self::requestHuodongId(), false);

        return $users[0];
    }

    public static function editorData(int $rotateId): array
    {
        $data = ['open' => 2, 'weight' => 0, 'title' => self::DEFAULT_TITLE, 'scores' => []];
        if ($rotateId <= 0) {
            return $data;
        }

        try {
            $rows = Db::query(
                'SELECT `open`, `weight`, `title` FROM `' . self::table('huodong_livemark_offsite_rotate') . '` WHERE `rotate_id` = ? LIMIT 1',
                [$rotateId]
            );
            if (isset($rows[0])) {
                $data['open'] = (int) $rows[0]['open'] === 1 ? 1 : 2;
                $data['weight'] = (int) $rows[0]['weight'];
                $data['title'] = (string) $rows[0]['title'] !== '' ? (string) $rows[0]['title'] : self::DEFAULT_TITLE;
            }

            $scores = Db::query(
                'SELECT `pfuser_id`, `score` FROM `' . self::table('huodong_livemark_offsite_score') . '` WHERE `rotate_id` = ?',
                [$rotateId]
            );
            foreach ($scores as $row) {
                $data['scores'][(int) $row['pfuser_id']] = (string) $row['score'];
            }
        } catch (\Throwable $exception) {
            Log::error(sprintf('Unable to read livemark offsite score for rotate %d: %s', $rotateId, $exception->getMessage()));
        }

        return $data;
    }

    /**
     * @param array<int, float> $scores pfuser id => off-site score
     */
    public static function save(int $huodongId, int $rotateId, int $open, int $weight, string $title, array $scores): void
    {
        if ($huodongId <= 0 || $rotateId <= 0 || !in_array($open, [1, 2], true) || $weight < 0 || $weight > 100) {
            throw new \InvalidArgumentException('Invalid livemark offsite score config');
        }
        $title = self::normalizeTitle($title);
        $rotateTable = self::table('huodong_livemark_offsite_rotate');
        $scoreTable = self::table('huodong_livemark_offsite_score');
        $now = time();

        Db::transaction(function () use ($huodongId, $rotateId, $open, $weight, $title, $scores, $rotateTable, $scoreTable, $now) {
            $owner = Db::query("SELECT `huodong_id` FROM `{$rotateTable}` WHERE `rotate_id` = ? LIMIT 1 FOR UPDATE", [$rotateId]);
            if (isset($owner[0]) && (int) $owner[0]['huodong_id'] !== $huodongId) {
                throw new \RuntimeException('Livemark rotate belongs to another activity');
            }

            Db::execute(
                "INSERT INTO `{$rotateTable}` (`huodong_id`, `rotate_id`, `open`, `weight`, `title`, `updated_at`) VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE `open` = VALUES(`open`), `weight` = VALUES(`weight`), `title` = VALUES(`title`), `updated_at` = VALUES(`updated_at`)",
                [$huodongId, $rotateId, $open, $weight, $title, $now]
            );

            foreach ($scores as $pfuserId => $score) {
                Db::execute(
                    "INSERT INTO `{$scoreTable}` (`huodong_id`, `rotate_id`, `pfuser_id`, `score`, `updated_at`) VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE `score` = VALUES(`score`), `updated_at` = VALUES(`updated_at`)",
                    [$huodongId, $rotateId, (int) $pfuserId, round((float) $score, 2), $now]
                );
            }
        });
    }

    /**
     * Single contestant detail (screen getuserdata). There `score` excludes the
     * manual adjustment and `score2` includes it; without `score2`, `score` is
     * the final value.
     */
    public static function applyToDetail(array $detail, ?int $huodongId): array
    {
        $pfuserId = (int) ($detail['id'] ?? 0);
        if ($pfuserId <= 0 || !array_key_exists('score', $detail)) {
            return $detail;
        }

        $resolved = self::resolve([$pfuserId], $huodongId);
        if ($resolved === null) {
            return $detail;
        }

        $weight = $resolved['weight'];
        $offsite = $resolved['scores'][$pfuserId] ?? 0.0;
        $basic = is_numeric($detail['basicscore'] ?? null) ? (float) $detail['basicscore'] : 0.0;
        $hasScore2 = array_key_exists('score2', $detail);
        $detail['offsite'] = self::info($resolved, $offsite, false);

        if (!self::isScored($detail['score'])) {
            return $detail;
        }

        $onsite = (float) $detail['score'] - ($hasScore2 ? 0.0 : $basic);
        $weighted = self::combine($onsite, $offsite, $weight, 0.0);
        $detail['offsite']['onsite'] = self::format($detail['score'], $onsite);

        if ($hasScore2) {
            $detail['score'] = self::format($detail['score'], $weighted);
            if (self::isScored($detail['score2'])) {
                $detail['score2'] = self::format($detail['score2'], $weighted + $basic);
            }
        } else {
            $detail['score'] = self::format($detail['score'], $weighted + $basic);
        }

        return $detail;
    }

    /**
     * Ranking-style lists (screen getscoredata, admin data list, wechat pages),
     * where each item's `score` already includes the manual adjustment.
     *
     * @param array<int, array> $users items with `id`, `score` and optionally `basicscore`
     */
    public static function applyToRanking(array $users, ?int $huodongId, bool $resort = true): array
    {
        $ids = [];
        foreach ($users as $user) {
            if (is_array($user) && (int) ($user['id'] ?? 0) > 0) {
                $ids[] = (int) $user['id'];
            }
        }

        $resolved = self::resolve($ids, $huodongId);
        if ($resolved === null) {
            return $users;
        }

        $needLookup = false;
        foreach ($users as $user) {
            if (is_array($user) && self::isScored($user['score'] ?? false) && !is_numeric($user['basicscore'] ?? null)) {
                $needLookup = true;
                break;
            }
        }
        $storedBasic = $needLookup ? self::basicScores($ids) : [];
        if ($storedBasic === null) {
            // Without the adjustment we cannot recover the on-site score; keep
            // the original list rather than publish a wrong ranking.
            return $users;
        }

        $weight = $resolved['weight'];
        foreach ($users as $key => $user) {
            if (!is_array($user) || (int) ($user['id'] ?? 0) <= 0) {
                continue;
            }
            $pfuserId = (int) $user['id'];
            $offsite = $resolved['scores'][$pfuserId] ?? 0.0;
            $user['offsite'] = self::info($resolved, $offsite, false);

            if (self::isScored($user['score'] ?? false)) {
                $basic = is_numeric($user['basicscore'] ?? null)
                    ? (float) $user['basicscore']
                    : (float) ($storedBasic[$pfuserId] ?? 0.0);
                $onsite = (float) $user['score'] - $basic;
                $user['offsite']['onsite'] = self::format($user['score'], $onsite);
                $user['score'] = self::format($user['score'], self::combine($onsite, $offsite, $weight, $basic));
            }
            $users[$key] = $user;
        }

        return $resort ? self::sortByScore($users) : $users;
    }

    /**
     * @return array{rotate_id:int, weight:int, title:string, scores:array<int, float>}|null
     */
    private static function resolve(array $pfuserIds, ?int $huodongId): ?array
    {
        $pfuserIds = array_values(array_unique(array_filter(array_map('intval', $pfuserIds), function ($id) {
            return $id > 0;
        })));
        if ($pfuserIds === []) {
            return null;
        }

        try {
            $placeholders = implode(',', array_fill(0, count($pfuserIds), '?'));
            $params = $pfuserIds;
            $sql = 'SELECT s.`rotate_id`, s.`pfuser_id`, s.`score`, r.`weight`, r.`title`'
                . ' FROM `' . self::table('huodong_livemark_offsite_score') . '` s'
                . ' INNER JOIN `' . self::table('huodong_livemark_offsite_rotate') . '` r ON r.`rotate_id` = s.`rotate_id` AND r.`open` = 1'
                . " WHERE s.`pfuser_id` IN ({$placeholders})";
            if ($huodongId !== null && $huodongId > 0) {
                $sql .= ' AND s.`huodong_id` = ? AND r.`huodong_id` = ?';
                $params[] = $huodongId;
                $params[] = $huodongId;
            }
            $rows = Db::query($sql, $params);
        } catch (\Throwable $exception) {
            Log::error(sprintf('Unable to resolve livemark offsite score: %s', $exception->getMessage()));

            return null;
        }

        if ($rows === []) {
            return null;
        }

        // A list always belongs to one rotate; pick the one most ids map to.
        $byRotate = [];
        foreach ($rows as $row) {
            $byRotate[(int) $row['rotate_id']][] = $row;
        }
        uasort($byRotate, function ($a, $b) {
            return count($b) <=> count($a);
        });
        $rotateRows = reset($byRotate);

        $resolved = [
            'rotate_id' => (int) $rotateRows[0]['rotate_id'],
            'weight' => max(0, min(100, (int) $rotateRows[0]['weight'])),
            'title' => (string) $rotateRows[0]['title'] !== '' ? (string) $rotateRows[0]['title'] : self::DEFAULT_TITLE,
            'scores' => [],
        ];
        foreach ($rotateRows as $row) {
            $resolved['scores'][(int) $row['pfuser_id']] = (float) $row['score'];
        }

        return $resolved;
    }

    /**
     * @return array<int, float>|null null when the legacy table cannot be read
     */
    private static function basicScores(array $pfuserIds): ?array
    {
        if ($pfuserIds === []) {
            return [];
        }

        try {
            $placeholders = implode(',', array_fill(0, count($pfuserIds), '?'));
            $rows = Db::query(
                'SELECT `id`, `basicscore` FROM `' . self::table('huodong_rotatelivemarkuser') . "` WHERE `id` IN ({$placeholders})",
                array_values($pfuserIds)
            );
        } catch (\Throwable $exception) {
            Log::error(sprintf('Unable to read livemark basicscore: %s', $exception->getMessage()));

            return null;
        }

        $scores = [];
        foreach ($rows as $row) {
            $scores[(int) $row['id']] = (float) $row['basicscore'];
        }

        return $scores;
    }

    private static function info(array $resolved, float $offsite, $onsite): array
    {
        return [
            'title' => $resolved['title'],
            'weight' => $resolved['weight'],
            'score' => number_format($offsite, 2, '.', ''),
            'onsite' => $onsite,
        ];
    }

    private static function combine(float $onsite, float $offsite, int $weight, float $basic): float
    {
        return $onsite * (100 - $weight) / 100 + $offsite * $weight / 100 + $basic;
    }

    private static function sortByScore(array $users): array
    {
        $indexed = [];
        foreach (array_values($users) as $position => $user) {
            $indexed[] = [$position, $user];
        }

        usort($indexed, function ($a, $b) {
            $aScored = self::isScored($a[1]['score'] ?? false);
            $bScored = self::isScored($b[1]['score'] ?? false);
            if ($aScored !== $bScored) {
                return $aScored ? -1 : 1;
            }
            if ($aScored) {
                $compare = (float) $b[1]['score'] <=> (float) $a[1]['score'];
                if ($compare !== 0) {
                    return $compare;
                }
            }

            return $a[0] <=> $b[0];
        });

        return array_column($indexed, 1);
    }

    private static function isScored($score): bool
    {
        return $score !== false && $score !== null && $score !== '' && is_numeric($score);
    }

    /**
     * Keeps the original value's type and decimal places, so integer and
     * one-decimal rotates stay consistent with the legacy output.
     */
    private static function format($original, float $value)
    {
        $decimals = 2;
        if (is_string($original)) {
            $trimmed = trim($original);
            if (preg_match('/\.(\d+)$/', $trimmed, $matches)) {
                $decimals = min(strlen($matches[1]), 4);
            } elseif (preg_match('/^-?\d+$/', $trimmed)) {
                $decimals = 0;
            }
        }
        $rounded = round($value, $decimals);

        return is_string($original) ? number_format($rounded, $decimals, '.', '') : $rounded;
    }

    private static function normalizeTitle(string $title): string
    {
        $title = trim(strip_tags($title));
        if ($title === '') {
            return self::DEFAULT_TITLE;
        }

        return mb_substr($title, 0, 20);
    }

    private static function table(string $name): string
    {
        $connection = (string) config('thinkorm.default', 'mysql');
        $prefix = (string) config("thinkorm.connections.{$connection}.prefix", '');
        $table = $prefix . $name;

        if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) {
            throw new \RuntimeException('Invalid livemark offsite table name');
        }

        return $table;
    }
}
