<?php

namespace app\middleware;

use app\common\service\common\LivemarkScoreReasonService;
use support\Log;
use Webman\Http\Request;
use Webman\Http\Response;
use Webman\MiddlewareInterface;

class LivemarkScoreReasonMiddleware implements MiddlewareInterface
{
    public function process(Request $request, callable $handler): Response
    {
        if (strtoupper($request->method()) !== 'POST') {
            return $handler($request);
        }

        $path = trim($request->path(), '/');
        if ($path === 'hdmanage/configlivemark/savepfuser') {
            return $this->saveReason($request, $handler);
        }
        if ($path === 'screen/livemark/getuserdata') {
            return $this->addReasonToScreenData($request, $handler);
        }
        return $handler($request);
    }

    private function saveReason(Request $request, callable $handler): Response
    {
        $submitted = $request->post('score_reason', null);
        if ($submitted === null) {
            return $handler($request);
        }
        if (!is_string($submitted)) {
            return $this->errorResponse('加减分原因格式不正确');
        }
        $reason = trim($submitted);
        if (!mb_check_encoding($reason, 'UTF-8') || mb_strlen($reason, 'UTF-8') > 30 || preg_match('/[\x00-\x1F\x7F]/u', $reason)) {
            return $this->errorResponse('加减分原因最多30字，且不能换行');
        }

        $response = $handler($request);
        $payload = $this->successfulPayload($response);
        if ($payload === null) {
            return $response;
        }

        $huodongId = (int) ($request->realhdid ?? 0);
        $id = $request->post('pfuserid') ?: ($payload['msg'] ?? null);
        $pfuserId = is_numeric($id) ? (int) $id : 0;
        try {
            LivemarkScoreReasonService::save($huodongId, $pfuserId, $reason);
        } catch (\Throwable $exception) {
            Log::error(sprintf('Unable to save score reason for participant %d: %s', $pfuserId, $exception->getMessage()));
            return $this->errorResponse('加减分原因保存失败，请稍后重试');
        }
        return $response;
    }

    private function addReasonToScreenData(Request $request, callable $handler): Response
    {
        $response = $handler($request);
        $payload = $this->successfulPayload($response);
        if ($payload === null || !is_array($payload['msg'] ?? null) || empty($payload['msg']['id'])
            || (float) ($payload['msg']['basicscore'] ?? 0) == 0.0) {
            return $response;
        }

        $payload['msg']['score_reason'] = LivemarkScoreReasonService::get(
            (int) ($request->realhdid ?? 0),
            (int) $payload['msg']['id']
        );
        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $body === false ? $response : $response->withBody($body);
    }

    private function successfulPayload(Response $response): ?array
    {
        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            return null;
        }
        $payload = json_decode($response->rawBody(), true);
        return is_array($payload) && isset($payload['code']) && (int) $payload['code'] === 0 ? $payload : null;
    }

    private function errorResponse(string $message): Response
    {
        return new Response(200, ['Content-Type' => 'application/json; charset=utf-8'], json_encode([
            'code' => -1,
            'msg' => $message,
        ], JSON_UNESCAPED_UNICODE));
    }
}
