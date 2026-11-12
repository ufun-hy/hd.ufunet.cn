<?php
namespace app\common\service\common;

final class ImportCjStyleConfig
{
    public static function normalize(array $style): array
    {
        // Combined vendor/custom forms formerly submitted these scalar fields twice.
        // Preserve the first (visible vendor control) value without writing stored data.
        foreach (['awardsize' => 30, 'prizesize' => 25, 'autoscrollspeed' => 50,
                  'topbg' => '', 'prizebg' => '', 'bottombg' => '', 'btn' => '',
                  'showstopbtn' => '2', 'hidevideo' => '', 'baozhavideo' => '',
                  'listname' => '中奖列表'] as $key => $default) {
            if (isset($style[$key]) && is_array($style[$key])) {
                $scalar = null;
                array_walk_recursive($style[$key], function ($value) use (&$scalar) {
                    if ($scalar === null && is_scalar($value)) $scalar = $value;
                });
                $style[$key] = $scalar ?? $default;
            }
        }
        return $style;
    }
}
