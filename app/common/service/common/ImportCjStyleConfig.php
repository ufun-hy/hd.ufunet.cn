<?php
namespace app\common\service\common;

final class ImportCjStyleConfig
{
    // Vendor 5.3.8 styles 5/6 keep vendor templates; styles 1-4 and 10-12 keep the
    // customized screen, result themes and prize stage they used before the upgrade.
    public static function usesCustomTemplate($flytype): bool
    {
        return !in_array((string) ($flytype ?? '1'), ['5', '6'], true);
    }

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
