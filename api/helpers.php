<?php
// api/helpers.php
function json_response($data, $code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function sample_podcasts($baseAssetPath = '/assets') {
    return [
        ['id'=>1,'title'=>'Daily Tech Brief','description'=>'Latest in tech and startups','artwork'=>"$baseAssetPath/icons/podcast-placeholder.svg",'audio'=>"$baseAssetPath/audio/silence.wav"],
        ['id'=>2,'title'=>'History Bites','description'=>'Short history stories','artwork'=>"$baseAssetPath/icons/podcast-placeholder.svg",'audio'=>"$baseAssetPath/audio/silence.wav"],
        ['id'=>3,'title'=>'Health Today','description'=>'Wellness and science','artwork'=>"$baseAssetPath/icons/podcast-placeholder.svg",'audio'=>"$baseAssetPath/audio/silence.wav"],
    ];
}

