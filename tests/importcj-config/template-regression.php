<?php
// php template-regression.php [repository root] [vendor directory]
// Uses ThinkPHP's real compiler; upload controls are inert inputs, no app/DB boot.
$root = $argv[1] ?? dirname(__DIR__, 2);
$vendor = $argv[2] ?? $root . '/vendor';
require_once $root . '/app/common/service/common/ImportCjStyleConfig.php';
spl_autoload_register(function ($class) use ($vendor) {
    if (strpos($class, 'think\\') === 0) {
        $file = $vendor . '/topthink/think-template/src/' . str_replace('\\', '/', substr($class, 6)) . '.php';
        if (is_file($file)) require_once $file;
    }
});
set_error_handler(function ($level, $message, $file, $line) {
    if (error_reporting() & $level) throw new ErrorException($message, 0, $level, $file, $line);
});
function request() { return (object) ['realhdid' => $GLOBALS['testActivity']]; }
function tomedia($value) { return trim($value ?? ''); }
function control($name, $value) {
    return '<input name="' . htmlspecialchars($name, ENT_QUOTES) . '" value="' . htmlspecialchars((string) ($value ?? ''), ENT_QUOTES) . '">';
}
function tpl_switch($name, $value, ...$args) { return control($name, $value); }
function tpl_image_one($name, $value, ...$args) { return control($name, $value); }
function tpl_video($name, $value, ...$args) { return control($name, $value); }
function tpl_audio($name, $value, ...$args) { return control($name, $value); }
function tpl_color($name, $value, ...$args) { return control($name, $value); }
function check($condition, $message) { if (!$condition) throw new RuntimeException($message); }
$base = $root . '/app/common/tpl/web/themes/default';
$parts = ['importcjstyle', 'importcjresultconfig', 'importcjmediaconfig', 'importcjlegacyconfig'];
$config = ['styleconfig' => []];
foreach (array_merge($parts, ['importcjstyle-custom', 'configscreenmusic']) as $part) {
    $source = file_get_contents($base . '/common/' . $part . '.html');
    preg_match_all('/\$config\[\x27([^\x27]+)\x27\](?:\[\x27([^\x27]+)\x27\])?/', $source, $matches, PREG_SET_ORDER);
    foreach ($matches as $m) {
        if ($m[1] === 'styleconfig') { if (isset($m[2])) $config['styleconfig'][$m[2]] = null; }
        else $config[$m[1]] = null;
    }
}
$config['fieldconfig'] = [['fieldname' => '姓名']];
foreach (['index', 'custom'] as $screen) {
    $source = file_get_contents($root . '/app/screen/view/importcj/' . $screen . '.html');
    preg_match_all('/\$pcconfig\[\x27styleconfig\x27\]\[\x27([^\x27]+)\x27\]/', $source, $matches);
    foreach ($matches[1] as $key) $config['styleconfig'][$key] = null;
}
$settings = ['awardsize' => '36', 'prizesize' => '28', 'autoscrollspeed' => '60',
    'topbg' => '/top.png', 'prizebg' => '/prize.png', 'bottombg' => '/bottom.png',
    'btn' => '/button.png', 'showstopbtn' => '1', 'hidevideo' => '/start.mp4',
    'baozhavideo' => '/end.mp4', 'listname' => '中奖名单'];
$defaults = array_merge($settings, ['awardsize' => '30', 'prizesize' => '25', 'autoscrollspeed' => '50',
    'topbg' => '', 'prizebg' => '', 'bottombg' => '', 'btn' => '', 'showstopbtn' => '2',
    'hidevideo' => '', 'baozhavideo' => '', 'listname' => '中奖列表']);
$cache = sys_get_temp_dir() . '/importcj-template-test-' . uniqid() . '/';
mkdir($cache, 0700);
define('SIMGURL', 'static/images/screen/');
// Real screen templates with inert shared header/footer, no sockets or app startup.
$screenViews = $cache . 'screen/';
mkdir($screenViews . 'importcj', 0700, true);
mkdir($screenViews . 'common', 0700, true);
foreach (['index', 'custom'] as $screen) copy($root . '/app/screen/view/importcj/' . $screen . '.html', $screenViews . 'importcj/' . $screen . '.html');
foreach (['common/header', 'common/footer', 'importcj/yanhua'] as $stub) file_put_contents($screenViews . $stub . '.html', '');
$styles = [];
foreach (range(1, 6) as $type) $styles[] = ['val' => (string) $type, 'name' => 'Style ' . $type, 'img' => '/style.png'];
$count = 0;
foreach ([0, 123] as $GLOBALS['testActivity']) {
    foreach (['1', '2', '3', '4', '5', '6', '10', '11', '12'] as $flytype) {
        foreach (['scalar', 'duplicate', 'nested', 'empty', 'zero'] as $scenario) {
            $data = $config;
            $data['styleconfig']['flytype'] = $flytype;
            foreach ($settings as $key => $value) {
                $data['styleconfig'][$key] = $scenario === 'duplicate' ? [$value, 'different later value'] :
                    ($scenario === 'nested' ? [[$value], $value] : ($scenario === 'empty' ? [] :
                    ($scenario === 'zero' ? ['0', $value] : $value)));
            }
            $engine = new think\Template(['view_path' => '/', 'cache_path' => $cache, 'tpl_cache' => false]);
            $template = '';
            foreach ($parts as $part) $template .= '{include file="$Wpath/common/' . $part . '" /}';
            ob_start();
            $engine->display($template, ['config' => $data, 'styles' => $styles, 'Wpath' => $base]);
            $html = ob_get_clean();
            preg_match_all('/<input\b[^>]*>/i', $html, $inputs);
            $values = [];
            foreach ($inputs[0] as $input) {
                if (preg_match('/type="(?:radio|checkbox)"/i', $input)) continue;
                if (!preg_match('/name="([^"]+)"/', $input, $name)) continue;
                preg_match('/value="([^"]*)"/', $input, $value);
                $values[$name[1]][] = html_entity_decode($value[1] ?? '', ENT_QUOTES, 'UTF-8');
            }
            foreach ($settings as $key => $value) {
                $name = 'styleconfig[' . $key . ']';
                check(count($values[$name] ?? []) === 1, "$flytype/$scenario: duplicate or missing $name");
                $expected = $scenario === 'empty' ? $defaults[$key] : ($scenario === 'zero' ? '0' : $value);
                check($values[$name][0] === $expected, "$flytype/$scenario: wrong recovered value for $name");
            }
            check(count($values['autoscroll'] ?? []) === 1, 'Missing legacy autoscroll setting');
            // Styles 1-4 must keep the customized form/screen (result themes, prize stage); only vendor 5/6 use vendor templates.
            $custom = !in_array($flytype, ['5', '6'], true);
            check((strpos($html, 'data-importcj-styles=') !== false) === $custom, "$flytype: wrong config template");
            $screenData = $data;
            $screenData['fieldconfig'] = [];
            $engine = new think\Template(['view_path' => $screenViews, 'cache_path' => $cache, 'tpl_cache' => false]);
            ob_start();
            $engine->fetch('importcj/index', ['pcconfig' => $screenData]);
            $screenHtml = ob_get_clean();
            check(strpos($screenHtml, 'importcj-mainbox') !== false, 'Screen body did not render');
            check((strpos($screenHtml, 'screen-prize.css') !== false) === $custom, "$flytype: wrong screen template");
            check(preg_match('/screenimportcj\.init\((\{[^\r\n]*\})\);/', $screenHtml, $init) === 1, 'Screen init config missing');
            $screenSettings = json_decode($init[1], true, 512, JSON_THROW_ON_ERROR);
            foreach ($settings as $key => $value) {
                $expected = $scenario === 'empty' ? $defaults[$key] : ($scenario === 'zero' ? '0' : $value);
                check(is_scalar($screenSettings[$key]) && (string) $screenSettings[$key] === $expected, 'Screen received array/wrong value: ' . $key);
            }
            $count++;
        }
    }
}
echo "PASS: $count config + $count screen render scenarios; all 11 affected settings remain scalar.\n";
echo "Test cache retained: $cache\n";
