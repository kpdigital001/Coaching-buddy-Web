<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/coachingbuddy-seo-private/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, private, max-age=0');
header('Referrer-Policy: no-referrer');

function reply(int $status, array $data): never {
    http_response_code($status);
    if (isset($data['config']) && is_array($data['config']) && empty($data['config']['entries'])) $data['config']['entries'] = new stdClass();
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function request_body(): array {
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 200000) reply(413, ['error'=>'Payload too large']);
    $body = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($body)) reply(400, ['error'=>'Invalid JSON request']);
    return $body;
}
function require_post_origin(): void {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['error'=>'Method not allowed']);
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = rtrim((string)cb_seo_config()['site_origin'], '/');
    if ($origin !== $allowed) reply(403, ['error'=>'Request origin not authorized. Configure site_origin for staging.']);
}
function require_admin(): void {
    cb_seo_session_start();
    if (!cb_seo_authenticated()) reply(401, ['error'=>'SEO Admin session expired. Please login again.']);
}
function require_csrf(): void {
    $csrf = $_SERVER['HTTP_X_CB_SEO_CSRF'] ?? '';
    if (!$csrf || !hash_equals((string)($_SESSION['seo_csrf'] ?? ''), $csrf)) reply(403, ['error'=>'Invalid CSRF token']);
}
function throttle_login(): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $path = CB_SEO_DATA_DIR . '/rate-' . hash('sha256', $ip . '-seo-login') . '.json';
    $now = time();
    $r = is_file($path) ? json_decode((string)file_get_contents($path), true) : [];
    $r = is_array($r) ? $r : [];
    $attempts = array_values(array_filter($r, fn($v) => is_int($v) && $v > $now - 900));
    if (count($attempts) >= 8) return false;
    $attempts[] = $now;
    @file_put_contents($path, json_encode($attempts), LOCK_EX);
    return true;
}

$action = (string)($_GET['action'] ?? '');
try {
    if ($action === 'published' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
        reply(200, ['config'=>cb_seo_read()]);
    }
    if ($action === 'session' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
        cb_seo_session_start();
        reply(200, ['authenticated'=>cb_seo_authenticated(), 'csrf'=>cb_seo_authenticated() ? ($_SESSION['seo_csrf'] ?? '') : '']);
    }
    if ($action === 'login') {
        require_post_origin();
        $data = request_body();
        cb_seo_session_start();
        if (!throttle_login()) reply(429, ['error'=>'Too many login attempts. Please try again later.']);
        $config = cb_seo_config();
        $email = strtolower(trim((string)($data['email'] ?? '')));
        $password = (string)($data['password'] ?? '');
        if (!hash_equals((string)$config['admin_email'], $email) || !password_verify($password, $config['password_hash'])) {
            reply(401, ['error'=>'Invalid SEO Admin email or password.']);
        }
        session_regenerate_id(true);
        $_SESSION['seo_email'] = $config['admin_email'];
        $_SESSION['seo_authenticated_until'] = time() + ((int)$config['session_hours'] * 3600);
        $_SESSION['seo_csrf'] = bin2hex(random_bytes(32));
        reply(200, ['authenticated'=>true, 'csrf'=>$_SESSION['seo_csrf']]);
    }
    if ($action === 'logout') {
        require_post_origin(); require_admin(); require_csrf();
        $_SESSION = [];
        session_destroy();
        reply(200, ['ok'=>true]);
    }
    if ($action === 'admin_state' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
        require_admin();
        $history = array_map(fn($h)=>['revision'=>(int)$h['revision'], 'at'=>$h['at']??'', 'key'=>$h['key']??'', 'action'=>$h['action']??''], cb_seo_history());
        reply(200, ['config'=>cb_seo_read(), 'history'=>$history]);
    }
    if (in_array($action, ['publish','remove','restore'], true)) {
        require_post_origin(); require_admin(); require_csrf();
        $data = request_body();
        $key = cb_seo_valid_key($data['key'] ?? null);
        if (!is_int($data['expectedRevision'] ?? null)) throw new InvalidArgumentException('Missing publishing revision.');
        $entry = null;
        if ($action === 'publish') $entry = cb_seo_clean_entry($data['entry'] ?? null);
        $restoreRev = ($action === 'restore' && is_int($data['restoreRevision'] ?? null)) ? $data['restoreRevision'] : null;
        $next = cb_seo_commit($action, $key, $entry, $data['expectedRevision'], $restoreRev);
        reply(200, ['ok'=>true, 'config'=>$next]);
    }
    reply(404, ['error'=>'Unknown SEO API endpoint.']);
} catch (DomainException $e) {
    reply(409, ['error'=>$e->getMessage()]);
} catch (InvalidArgumentException $e) {
    reply(400, ['error'=>$e->getMessage()]);
} catch (Throwable $e) {
    error_log('CoachingBuddy SEO publisher: ' . $e->getMessage());
    reply(500, ['error'=>'Server publishing error. Check private folder permissions and server logs.']);
}