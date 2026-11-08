<?php

namespace app\middleware;

use app\common\service\common\LivemarkOffsiteAccessService;
use support\Log;
use Webman\Http\Request;
use Webman\Http\Response;
use Webman\MiddlewareInterface;

/**
 * Persists the admin-only off-site score switch from hdinfo special settings.
 * The switch is accepted only with the session token issued by the admin-only
 * block of the hdinfo view; otherwise it is ignored.
 */
class LivemarkOffsiteAccessMiddleware implements MiddlewareInterface
{
    private const SAVE_PATH = 'hdmanage/hdinfo/index';

    public function process(Request $request, callable $handler): Response
    {
        $open = $this->requestedOpen($request);
        $response = $handler($request);

        if ($open === null || !$this->isSuccessfulSave($response)) {
            return $response;
        }

        $huodongId = $this->resolvedHuodongId($request);
        $token = (string) $request->post('livemarkoffsitetoken', '');
        if ($huodongId === null || !LivemarkOffsiteAccessService::verifyToken($request, $huodongId, $token)) {
            return $response;
        }

        try {
            LivemarkOffsiteAccessService::save($huodongId, $open);
        } catch (\Throwable $exception) {
            Log::error(sprintf(
                'Unable to persist livemark offsite access for activity %d: %s',
                $huodongId,
                $exception->getMessage()
            ));

            return $this->errorResponse('活动信息已保存，但评分场外分数开关保存失败，请稍后重试');
        }

        return $response;
    }

    private function requestedOpen(Request $request): ?int
    {
        if (strtoupper($request->method()) !== 'POST' || trim($request->path(), '/') !== self::SAVE_PATH) {
            return null;
        }

        $value = (string) $request->post('livemarkoffsiteopen', '');

        return in_array($value, ['1', '2'], true) ? (int) $value : null;
    }

    private function isSuccessfulSave(Response $response): bool
    {
        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            return false;
        }

        $payload = json_decode($response->rawBody(), true);

        return is_array($payload) && isset($payload['code']) && (int) $payload['code'] === 0;
    }

    private function resolvedHuodongId(Request $request): ?int
    {
        $value = $request->realhdid ?? null;
        if (!is_numeric($value) || (int) $value <= 0) {
            return null;
        }

        return (int) $value;
    }

    private function errorResponse(string $message): Response
    {
        return new Response(200, ['Content-Type' => 'application/json; charset=utf-8'], json_encode([
            'code' => -1,
            'msg' => $message,
        ], JSON_UNESCAPED_UNICODE));
    }
}
