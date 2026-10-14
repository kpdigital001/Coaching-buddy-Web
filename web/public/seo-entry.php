<?php
declare(strict_types=1);
// Entry for public HTML requests only. Static files and existing /api are bypassed by .htaccess.
$index = __DIR__ . '/index.html';
if (!is_file($index)) { http_response_code(503); exit('Site build missing.'); }
$html = (string)file_get_contents($index);
$bootstrap = dirname(__DIR__) . '/coachingbuddy-seo-private/bootstrap.php';
if (is_file($bootstrap)) {
    require $bootstrap;
    $config = cb_seo_read();
    $entries = $config['entries'] ?? [];
    $path = rawurldecode((string)(parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/'));
    $segments = array_values(array_filter(explode('/', trim($path, '/')), 'strlen'));
    $key = '';
    if (count($segments) === 2 && $segments[0] === 'coaching-institutes') {
        $key = 'city:' . $segments[1];
    } elseif (count($segments) === 3 && $segments[0] === 'coaching-institutes') {
        $key = 'category:' . $segments[1] . ':' . $segments[2];
    } elseif (count($segments) === 3 && $segments[0] === 'institute') {
        $split = strrpos($segments[2], '--');
        if ($split !== false) $key = 'institute:' . substr($segments[2], $split + 2);
    } elseif (count($segments) === 2 && $segments[0] === 'institute') {
        $key = 'institute:' . $segments[1];
    }
    $entry = ($key && isset($entries[$key]) && is_array($entries[$key])) ? $entries[$key] : null;
    $private = preg_match('#^/(seo-admin|student/(login|verify-otp|complete-profile|profile|bookings|saved)|institute/(login|dashboard|onboard)|dashboard|settings|bookings)(/|$)#i', $path) === 1;
    if ($entry || $private) {
        $escape = static fn($s) => htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
        $replace = static function(string $html, string $pattern, string $value): string {
            return preg_replace($pattern, '$1' . str_replace('$', '\\$', $value) . '$3', $html, 1) ?? $html;
        };
        $setMeta = static function(string $html, string $attribute, string $name, string $value) use ($escape): string {
            $pattern = '~(<meta\s+' . $attribute . '="' . preg_quote($name, '~') . '"\s+content=")[^"]*("[^>]*>)~i';
            $escaped = $escape($value);
            if (preg_match($pattern, $html)) {
                return preg_replace_callback($pattern, static fn($m)=>$m[1].$escaped.$m[2], $html, 1) ?? $html;
            }
            return str_replace('</head>', '<meta ' . $attribute . '="' . $escape($name) . '" content="' . $escaped . '">' . "\n" . '</head>', $html);
        };
        if ($entry) {
            $title = trim((string)($entry['title'] ?? ''));
            $description = trim((string)($entry['description'] ?? ''));
            $canonical = (string)($entry['canonical'] ?? '');
            $site = rtrim((string)cb_seo_config()['site_origin'], '/');
            if (!$canonical) $canonical = $site . $path;
            if ($title !== '') {
                $html = preg_replace_callback('~<title>.*?</title>~is', static fn($m) => '<title>' . $escape($title) . ' | Coaching Buddy</title>', $html, 1) ?? $html;
                $html = $setMeta($html, 'property', 'og:title', $title . ' | Coaching Buddy');
                $html = $setMeta($html, 'name', 'twitter:title', $title . ' | Coaching Buddy');
            }
            if ($description !== '') {
                $html = $setMeta($html, 'name', 'description', $description);
                $html = $setMeta($html, 'property', 'og:description', $description);
                $html = $setMeta($html, 'name', 'twitter:description', $description);
            }
            $html = preg_replace_callback('~<link\s+rel="canonical"\s+href="[^"]*"\s*/?>~i', static fn($m) => '<link rel="canonical" href="' . $escape($canonical) . '" />', $html, 1) ?? $html;
            $html = $setMeta($html, 'property', 'og:url', $canonical);
            $html = $setMeta($html, 'name', 'robots', (($entry['index'] ?? true) === false ? 'noindex, follow' : 'index, follow, max-image-preview:large'));
            if (!empty($entry['faqs']) && is_array($entry['faqs'])) {
                $faqs = [];
                foreach ($entry['faqs'] as $faq) {
                    if (!is_array($faq) || empty($faq['question']) || empty($faq['answer'])) continue;
                    $faqs[] = ['@type'=>'Question', 'name'=>(string)$faq['question'], 'acceptedAnswer'=>['@type'=>'Answer','text'=>(string)$faq['answer']]];
                }
                if ($faqs) {
                    $schema = ['@context'=>'https://schema.org','@type'=>'FAQPage','mainEntity'=>$faqs];
                    $json = json_encode($schema, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_HEX_APOS | JSON_UNESCAPED_SLASHES);
                    $html = str_replace('</head>', '<script id="coaching-buddy-schema-jsonld" type="application/ld+json">'.$json.'</script>' . "\n" . '</head>', $html);
                }
            }
        } elseif ($private) {
            $html = $setMeta($html, 'name', 'robots', 'noindex, nofollow');
        }
    }
}
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, must-revalidate');
header('X-Content-Type-Options: nosniff');
echo $html;