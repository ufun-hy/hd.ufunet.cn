<?php
// Minimal stand-ins for webman / think-orm so the custom code runs against a real MySQL.

namespace support {
    class Log
    {
        public static function error($message): void
        {
            $GLOBALS['__logs'][] = $message;
        }
    }
}

namespace think\facade {
    class Db
    {
        public static \PDO $pdo;

        public static function query(string $sql, array $params = []): array
        {
            $stmt = self::$pdo->prepare($sql);
            $stmt->execute(array_values($params));

            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        public static function execute(string $sql, array $params = []): int
        {
            $stmt = self::$pdo->prepare($sql);
            $stmt->execute(array_values($params));

            return $stmt->rowCount();
        }

        public static function transaction(callable $callback)
        {
            self::$pdo->beginTransaction();
            try {
                $result = $callback();
                self::$pdo->commit();

                return $result;
            } catch (\Throwable $e) {
                self::$pdo->rollBack();
                throw $e;
            }
        }
    }
}

namespace Webman\Http {
    class Request
    {
        public $realhdid;

        public function __construct(private string $method, private string $path, private array $postData = [], $realhdid = null)
        {
            $this->realhdid = $realhdid;
        }

        public function method(): string
        {
            return $this->method;
        }

        public function path(): string
        {
            return $this->path;
        }

        public function post($name = null, $default = null)
        {
            if ($name === null) {
                return $this->postData;
            }

            return $this->postData[$name] ?? $default;
        }
    }

    class Response
    {
        public function __construct(private int $status = 200, private array $headers = [], private string $body = '')
        {
        }

        public function getStatusCode(): int
        {
            return $this->status;
        }

        public function rawBody(): string
        {
            return $this->body;
        }

        public function withBody($body): static
        {
            $this->body = (string) $body;

            return $this;
        }
    }
}

namespace Webman {
    interface MiddlewareInterface
    {
        public function process(Http\Request $request, callable $handler): Http\Response;
    }
}

namespace {
    function config($key, $default = null)
    {
        return ['thinkorm.default' => 'mysql', 'thinkorm.connections.mysql.prefix' => 'mibov3_'][$key] ?? $default;
    }

    function request()
    {
        return $GLOBALS['__request'];
    }
}
