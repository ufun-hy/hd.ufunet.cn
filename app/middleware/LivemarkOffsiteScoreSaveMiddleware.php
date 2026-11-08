<?php

namespace app\middleware;

use app\common\service\common\LivemarkOffsiteScoreService;
use support\Log;
use Webman\Http\Request;
use Webman\Http\Response;
use Webman\MiddlewareInterface;

/**
 * Persists the off-site score tab of the rotate editor around the encrypted
 * saverotate action, which ignores fields it does not know.
 */
class LivemarkOffsiteScoreSaveMiddleware implements MiddlewareInterface
{
    private const SAVE_PATH = 'hdmanage/configlivemark/saverotate';

    public function process(Request $request, callable $handler): Response
    {
        if (strtoupper($request->method()) !== 'POST' || trim($request->path(), '/') !== self::SAVE_PATH) {
            return $handler($request);
        }

        $open = (string) $request->post('offsiteopen', '');
        if (!in_array($open, ['1', '2'], true)) {
            return $handler($request);
        }

        $weight = trim((string) $request->post('offsiteweight', '0'));
        if (!preg_match('/^\d{1,3}$/', $weight) || (int) $weight > 100) {
            return $this->errorResponse('场外分数占比请填写0-100的整数');
        }
        if ($open === '1' && (int) $weight === 0) {
            return $this->errorResponse('启用场外分数后，占比必须大于0');
        }

        $scores = [];
        foreach ((array) $request->post() as $key => $value) {
            if (!is_string($key) || !preg_match('/^offsitescore_(\d+)$/', $key, $matches)) {
                continue;
            }
            $value = trim((string) $value);
            if ($value === '') {
                $value = '0';
            }
            if (!is_numeric($value) || (float) $value < 0 || (float) $value > LivemarkOffsiteScoreService::MAX_SCORE) {
                return $this->errorResponse('场外分数必须是不小于0的数字');
            }
            $scores[(int) $matches[1]] = (float) $value;
        }

        $response = $handler($request);
        if (!$this->isSuccessfulSave($response)) {
            return $response;
        }

        $huodongId = $this->positiveInt($request->realhdid ?? null);
        $rotateId = $this->positiveInt($request->post('rotateid'));
        if ($huodongId === null || $rotateId === null) {
            return $this->errorResponse('轮次已保存，但无法识别轮次，场外分数未保存');
        }

        try {
            LivemarkOffsiteScoreService::save(
                $huodongId,
                $rotateId,
                (int) $open,
                (int) $weight,
                (string) $request->post('offsitename', ''),
                $scores
            );
        } catch (\Throwable $exception) {
            Log::error(sprintf(
                'Unable to persist livemark offsite score for activity %d rotate %d: %s',
                $huodongId,
                $rotateId,
                $exception->getMessage()
            ));

            return $this->errorResponse('轮次已保存，但场外分数保存失败，请稍后重试');
        }

        return $response;
    }

    private function isSuccessfulSave(Response $response): bool
    {
        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            return false;
        }

        $payload = json_decode($response->rawBody(), true);

        return is_array($payload) && isset($payload['code']) && (int) $payload['code'] === 0;
    }

    private function positiveInt($value): ?int
    {
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
