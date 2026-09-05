<?php

namespace app\middleware;

use app\common\service\common\LivemarkDeductionScoreVisibilityService;
use support\Log;
use Webman\Http\Request;
use Webman\Http\Response;
use Webman\MiddlewareInterface;

class LivemarkDeductionScoreVisibilityMiddleware implements MiddlewareInterface
{
    private const SAVE_PATHS = [
        'hdmanage/configlivemark/index',
        'web/hdconfig/livemark',
    ];

    public function process(Request $request, callable $handler): Response
    {
        $visibility = $this->requestedVisibility($request);
        $response = $handler($request);

        if ($visibility === null || !$this->isSuccessfulSave($response)) {
            return $response;
        }

        $huodongId = $this->resolvedHuodongId($request);
        if ($huodongId === null) {
            return $this->errorResponse('无法识别当前活动，扣分与最终得分显示设置未保存');
        }

        try {
            LivemarkDeductionScoreVisibilityService::save($huodongId, $visibility);
        } catch (\Throwable $exception) {
            Log::error(sprintf(
                'Unable to persist showdecscore for activity %d: %s',
                $huodongId,
                $exception->getMessage()
            ));

            return $this->errorResponse('扣分与最终得分显示设置保存失败，请稍后重试');
        }

        return $response;
    }

    private function requestedVisibility(Request $request): ?int
    {
        if (strtoupper($request->method()) !== 'POST') {
            return null;
        }

        if (!in_array(trim($request->path(), '/'), self::SAVE_PATHS, true)) {
            return null;
        }

        $value = (string) $request->post('showdecscore', '');
        if (!in_array($value, ['1', '2'], true)) {
            return null;
        }

        return (int) $value;
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
