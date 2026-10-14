<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/coachingbuddy-seo-private/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, must-revalidate');
header('X-Content-Type-Options: nosniff');
$config = cb_seo_read();
if (!$config['entries']) $config['entries'] = new stdClass();
echo json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);