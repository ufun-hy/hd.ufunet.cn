<?php

namespace app\middleware;

use app\common\service\common\LivemarkOffsiteScoreService;
use support\Log;
use Webman\Http\Request;
use Webman\Http\Response;
use Webman\MiddlewareInterface;

/**
 * Rewrites the scores returned by the encrypted livemark actions so that the
 * screen, ranking and admin list show the off-site weighted final score.
 */
class LivemarkOffsiteScoreResponseMiddleware implements MiddlewareInterface
{
    private const DETAIL_PATH = 'screen/livemark/getuserdata';
    private const RANKING_PATH = 'screen/livemark/getscoredata';
    private const ADMIN_LIST_PATH = 'hdmanage/datalivemark/index';

    public function process(Request $request, callable $handler): Response
    {
        $path = trim($request->path(), '/');
        $response = $handler($request);

        if (!in_array($path, [self::DETAIL_PATH, self::RANKING_PATH, self::ADMIN_LIST_PATH], true)
            || $response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            return $response;
        }

        $payload = json_decode($response->rawBody(), true);
        if (!is_array($payload)) {
            return $response;
        }

        $huodongId = LivemarkOffsiteScoreService::requestHuodongId();

        try {
            if ($path === self::ADMIN_LIST_PATH) {
                $changed = $this->applyToAdminList($payload, $huodongId);
            } else {
                $changed = $this->applyToScreen($payload, $path, $huodongId);
            }
        } catch (\Throwable $exception) {
            Log::error(sprintf('Unable to apply livemark offsite score on %s: %s', $path, $exception->getMessage()));

            return $response;
        }

        if (!$changed) {
            return $response;
        }

        return $response->withBody(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    private function applyToScreen(array &$payload, string $path, ?int $huodongId): bool
    {
        if (!isset($payload['code']) || (int) $payload['code'] !== 0 || !is_array($payload['msg'] ?? null)) {
            return false;
        }

        if ($path === self::DETAIL_PATH) {
            $payload['msg'] = LivemarkOffsiteScoreService::applyToDetail($payload['msg'], $huodongId);

            return isset($payload['msg']['offsite']);
        }

        if (!is_array($payload['msg']['pfusers'] ?? null)) {
            return false;
        }
        $payload['msg']['pfusers'] = LivemarkOffsiteScoreService::applyToRanking($payload['msg']['pfusers'], $huodongId);

        return true;
    }

    /**
     * bootstrap-table rows: `id` is the pfuser id, the score sits in `scoredata`.
     * Rows are paginated server-side, so the order is left untouched.
     */
    private function applyToAdminList(array &$payload, ?int $huodongId): bool
    {
        if (is_array($payload['rows'] ?? null)) {
            $rows = &$payload['rows'];
        } elseif (is_array($payload['msg']['rows'] ?? null)) {
            $rows = &$payload['msg']['rows'];
        } elseif (is_array($payload['data']['rows'] ?? null)) {
            $rows = &$payload['data']['rows'];
        } else {
            return false;
        }

        $items = [];
        foreach ($rows as $key => $row) {
            if (!is_array($row) || !is_array($row['scoredata'] ?? null) || !array_key_exists('score', $row['scoredata'])) {
                continue;
            }
            $item = ['id' => $row['id'] ?? 0, 'score' => $row['scoredata']['score']];
            if (array_key_exists('basicscore', $row)) {
                $item['basicscore'] = $row['basicscore'];
            }
            $items[$key] = $item;
        }
        if ($items === []) {
            return false;
        }

        $changed = false;
        foreach (LivemarkOffsiteScoreService::applyToRanking($items, $huodongId, false) as $key => $item) {
            if (!isset($item['offsite'])) {
                continue;
            }
            $rows[$key]['scoredata']['score'] = $item['score'];
            $rows[$key]['scoredata']['offsite'] = $item['offsite'];
            $changed = true;
        }

        return $changed;
    }
}
