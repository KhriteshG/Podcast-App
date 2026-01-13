<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: *");
header("Content-Type: text/xml; charset=utf-8");

if (!isset($_GET['url'])) {
    http_response_code(400);
    echo "Missing URL";
    exit;
}

$url = $_GET['url'];
$url = filter_var($url, FILTER_SANITIZE_URL);

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo "Invalid URL";
    exit;
}

// Fetch RSS content
$opts = [
    "http" => [
        "method" => "GET",
        "header" => "User-Agent: PodcastPlus/1.0\r\n"
    ]
];

$context = stream_context_create($opts);
$data = @file_get_contents($url, false, $context);

if ($data === false) {
    http_response_code(500);
    echo "Failed to load feed.";
    exit;
}

echo $data;
