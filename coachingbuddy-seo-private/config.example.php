<?php
/** Server-only config: copy to config.php OUTSIDE the web root; never commit the real config. */
return [
    'site_origin' => 'https://coachingbuddy.co.in',
    'admin_email' => 'seo@coachingbuddy.co.in',
    'password_hash' => getenv('CB_SEO_PASSWORD_HASH') ?: '',
    'session_hours' => 8,
];