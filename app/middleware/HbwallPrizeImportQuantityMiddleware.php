<?php

namespace app\middleware;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Webman\Http\Request;
use Webman\Http\Response;
use Webman\Http\UploadFile;
use Webman\MiddlewareInterface;

/**
 * Expands each 红包墙 import row into one row per packet before the legacy
 * importer persists it. The legacy importer therefore continues to create
 * each packet through its normal insert path and each packet receives its own
 * database primary key.
 */
class HbwallPrizeImportQuantityMiddleware implements MiddlewareInterface
{
    private const MAX_QUANTITY_PER_ROW = 500;
    private const MAX_PACKET_INSTANCES_PER_FILE = 5000;

    public function process(Request $request, callable $handler): Response
    {
        if (trim($request->path(), '/') !== 'hdmanage/confighbwall/importprize') {
            return $handler($request);
        }

        try {
            $file = $request->file('file');
            if ($file instanceof UploadFile && $file->isValid()) {
                $this->expandQuantityRows($file);
            }
        } catch (\Throwable $exception) {
            return new Response(200, ['Content-Type' => 'application/json; charset=utf-8'], json_encode([
                'code' => -1,
                'msg' => '奖品数量展开失败：' . $exception->getMessage(),
            ], JSON_UNESCAPED_UNICODE));
        }

        return $handler($request);
    }

    private function expandQuantityRows(UploadFile $file): void
    {
        $extension = strtolower($file->getUploadExtension());
        if (!in_array($extension, ['xls', 'xlsx'], true)) {
            return;
        }

        $sourcePath = $file->getPathname();
        $spreadsheet = IOFactory::load($sourcePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $quantityColumn = $this->findQuantityColumn($worksheet);

        if ($quantityColumn === null) {
            throw new \RuntimeException('导入模板缺少“奖品数量”列');
        }

        $highestRow = $worksheet->getHighestDataRow();
        $highestColumn = Coordinate::columnIndexFromString($worksheet->getHighestDataColumn());
        $packetCount = 0;

        for ($row = $highestRow; $row >= 2; $row--) {
            $values = $this->readRow($worksheet, $row, $highestColumn);
            if ($this->isBlankRow($values)) {
                continue;
            }

            $quantity = $this->normaliseQuantity($values[$quantityColumn]);
            $packetCount += $quantity;
            if ($packetCount > self::MAX_PACKET_INSTANCES_PER_FILE) {
                throw new \RuntimeException('单次导入生成的红包实例不能超过 ' . self::MAX_PACKET_INSTANCES_PER_FILE . ' 个');
            }

            $worksheet->setCellValueByColumnAndRow($quantityColumn, $row, 1);
            if ($quantity === 1) {
                continue;
            }

            $worksheet->insertNewRowBefore($row + 1, $quantity - 1);
            for ($copy = 1; $copy < $quantity; $copy++) {
                $targetRow = $row + $copy;
                foreach ($values as $column => $value) {
                    $worksheet->setCellValueByColumnAndRow($column, $targetRow, $value);
                }
                $worksheet->setCellValueByColumnAndRow($quantityColumn, $targetRow, 1);
            }
        }

        $this->saveInPlace($spreadsheet, $sourcePath, $extension);
    }

    private function findQuantityColumn(Worksheet $worksheet): ?int
    {
        $highestColumn = Coordinate::columnIndexFromString($worksheet->getHighestDataColumn());
        for ($column = 1; $column <= $highestColumn; $column++) {
            $heading = trim((string) $worksheet->getCellByColumnAndRow($column, 1)->getValue());
            if (mb_strpos($heading, '数量') !== false) {
                return $column;
            }
        }

        return null;
    }

    private function readRow(Worksheet $worksheet, int $row, int $highestColumn): array
    {
        $values = [];
        for ($column = 1; $column <= $highestColumn; $column++) {
            $values[$column] = $worksheet->getCellByColumnAndRow($column, $row)->getValue();
        }

        return $values;
    }

    private function isBlankRow(array $values): bool
    {
        foreach ($values as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }

    private function normaliseQuantity($value): int
    {
        $quantity = is_numeric($value) ? (int) $value : 1;
        $quantity = max(1, $quantity);

        return min($quantity, self::MAX_QUANTITY_PER_ROW);
    }

    private function saveInPlace($spreadsheet, string $sourcePath, string $extension): void
    {
        $temporaryPath = tempnam(dirname($sourcePath), 'hbwall-import-');
        if ($temporaryPath === false) {
            throw new \RuntimeException('无法创建导入文件临时副本');
        }

        try {
            $writer = IOFactory::createWriter($spreadsheet, $extension === 'xlsx' ? 'Xlsx' : 'Xls');
            $writer->save($temporaryPath);
            if (!rename($temporaryPath, $sourcePath)) {
                throw new \RuntimeException('无法更新导入文件');
            }
        } finally {
            if (is_file($temporaryPath)) {
                @unlink($temporaryPath);
            }
        }
    }
}
