<?php
declare(strict_types=1);

const CB_SEO_PRIVATE_DIR = __DIR__;
const CB_SEO_DATA_DIR = __DIR__ . '/data';
const CB_SEO_LIVE_FILE = __DIR__ . '/data/live.json';
const CB_SEO_HISTORY_FILE = __DIR__ . '/data/history.json';
const CB_SEO_LOCK_FILE = __DIR__ . '/data/state.lock';

function cb_seo_config(): array {
    static $config;
    if ($config === null) {
        $config = require CB_SEO_PRIVATE_DIR . '/config.php';
    }
    return $config;
}

function cb_seo_empty(): array {
    return ['version'=>1, 'generatedAt'=>gmdate('c'), 'entries'=>[], 'revision'=>0];
}
function cb_seo_read(): array {
    if (!is_file(CB_SEO_LIVE_FILE)) return cb_seo_empty();
    $raw = file_get_contents(CB_SEO_LIVE_FILE);
    $parsed = $raw === false ? null : json_decode($raw, true);
    if (!is_array($parsed) || ($parsed['version'] ?? null) !== 1 || !is_array($parsed['entries'] ?? null)) {
        return cb_seo_empty();
    }
    return $parsed + ['revision'=>0];
}
function cb_seo_history(): array {
    if (!is_file(CB_SEO_HISTORY_FILE)) return [];
    $decoded = json_decode((string)file_get_contents(CB_SEO_HISTORY_FILE), true);
    return is_array($decoded) ? $decoded : [];
}
function cb_seo_write_atomic(string $filename, array $content): void {
    if (array_key_exists('entries', $content) && is_array($content['entries']) && !$content['entries']) $content['entries'] = new stdClass();
    $json = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    $temp = tempnam(CB_SEO_DATA_DIR, 'cbseo_');
    if ($temp === false) throw new RuntimeException('SEO storage is not writable.');
    try {
        if (file_put_contents($temp, $json, LOCK_EX) === false) throw new RuntimeException('Cannot write SEO data.');
        @chmod($temp, 0640);
        if (!rename($temp, $filename)) throw new RuntimeException('Cannot replace SEO data.');
    } finally {
        if (file_exists($temp)) unlink($temp);
    }
}
function cb_seo_sanitize_text($value, int $max = 500): string {
    if (!is_string($value)) return '';
    $v = trim(str_replace("\0", '', $value));
    if (strlen($v) > $max * 4) throw new InvalidArgumentException('A SEO field is too long.');
    if (function_exists('mb_strlen') && mb_strlen($v) > $max) throw new InvalidArgumentException('A SEO field is too long.');
    return $v;
}
function cb_seo_valid_key($key): string {
    if (!is_string($key) || strlen($key) > 250 || !preg_match('/^(city:[a-z0-9-]+|category:[a-z0-9-]+:[a-z0-9-]+|institute:[a-zA-Z0-9_-]+)$/D', $key)) {
        throw new InvalidArgumentException('Invalid SEO page key.');
    }
    return $key;
}
function cb_seo_clean_entry($entry): array {
    if (!is_array($entry)) throw new InvalidArgumentException('SEO form is invalid.');
    $result = [];
    foreach (['title'=>200, 'description'=>500, 'h1'=>250, 'intro'=>10000] as $field=>$max) {
        $v = cb_seo_sanitize_text($entry[$field] ?? '', $max);
        if ($v !== '') $result[$field] = $v;
    }
    $canonical = cb_seo_sanitize_text($entry['canonical'] ?? '', 1000);
    if ($canonical !== '') {
        // Preserve previous dashboard behavior: allow same-site relative canonical paths.
        if (str_starts_with($canonical, '/') && !str_starts_with($canonical, '//')) {
            $canonical = rtrim((string)cb_seo_config()['site_origin'], '/') . $canonical;
        }
        $url = parse_url($canonical);
        $origin = parse_url((string)cb_seo_config()['site_origin']);
        if (!$url || strtolower($url['scheme'] ?? '') !== 'https' || strtolower($url['host'] ?? '') !== strtolower($origin['host'] ?? '') || isset($url['user']) || isset($url['fragment']) || (isset($url['port']) && $url['port'] !== 443)) {
            throw new InvalidArgumentException('Canonical URL must be an HTTPS CoachingBuddy URL.');
        }
        $result['canonical'] = $canonical;
    }
    $result['index'] = ($entry['index'] ?? true) !== false;
    $faqs = $entry['faqs'] ?? [];
    if (!is_array($faqs) || count($faqs) > 12) throw new InvalidArgumentException('Too many FAQ entries.');
    $result['faqs'] = [];
    foreach ($faqs as $faq) {
        if (!is_array($faq)) continue;
        $q = cb_seo_sanitize_text($faq['question'] ?? '', 300);
        $a = cb_seo_sanitize_text($faq['answer'] ?? '', 2000);
        if ($q !== '' && $a !== '') $result['faqs'][] = ['question'=>$q, 'answer'=>$a];
    }
    $result['updatedAt'] = gmdate('c');
    return $result;
}
function cb_seo_commit(string $mode, string $key, ?array $entry, int $expectedRevision, ?int $restoreRevision = null): array {
    if (!is_dir(CB_SEO_DATA_DIR) || !is_writable(CB_SEO_DATA_DIR)) throw new RuntimeException('SEO data directory is not writable.');
    $lock = fopen(CB_SEO_LOCK_FILE, 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Cannot lock SEO data.');
    try {
        $live = cb_seo_read();
        $rev = (int)($live['revision'] ?? 0);
        if ($rev !== $expectedRevision) throw new DomainException('SEO data was changed in another session. Refresh before publishing.');
        $history = cb_seo_history();
        if ($mode === 'restore') {
            $snapshot = null;
            foreach ($history as $item) {
                if ((int)($item['revision'] ?? -1) === $restoreRevision) { $snapshot = $item['entries'] ?? null; break; }
            }
            if (!is_array($snapshot)) throw new InvalidArgumentException('Previous version not found.');
            $entry = $snapshot[$key] ?? null;
        }
        // Save full previous snapshot before each change. Restore only the requested page key.
        array_unshift($history, ['revision'=>$rev, 'at'=>gmdate('c'), 'action'=>$mode, 'key'=>$key, 'entries'=>$live['entries']]);
        $history = array_slice($history, 0, 30);
        if ($entry === null) unset($live['entries'][$key]);
        else $live['entries'][$key] = ($mode === 'restore') ? cb_seo_clean_entry($entry) : $entry;
        $live['generatedAt'] = gmdate('c');
        $live['revision'] = $rev + 1;
        cb_seo_write_atomic(CB_SEO_LIVE_FILE, $live);
        cb_seo_write_atomic(CB_SEO_HISTORY_FILE, $history);
        return $live;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}
function cb_seo_session_start(): void {
    $secure = true; // SEO admin is served over HTTPS only.
    session_name('CB_SEO_PUBLISH_SESSION');
    session_set_cookie_params(['lifetime'=>0, 'path'=>'/seo-publisher', 'secure'=>$secure, 'httponly'=>true, 'samesite'=>'Strict']);
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
}
function cb_seo_authenticated(): bool {
    $hours = max(1, min(24, (int)cb_seo_config()['session_hours']));
    $expires = (int)($_SESSION['seo_authenticated_until'] ?? 0);
    return ($_SESSION['seo_email'] ?? '') === cb_seo_config()['admin_email'] && $expires > time() && $expires <= time() + $hours * 3600;
}