<?php
// api/search_itunes.php
header("Content-Type: application/json; charset=utf-8");

$q = isset($_GET["q"]) ? urlencode($_GET["q"]) : "";
if ($q === "") {
    echo json_encode([]);
    exit;
}

// iTunes Search API (free, no key required)
$url = "https://itunes.apple.com/search?term={$q}&media=podcast&limit=25";

$data = file_get_contents($url);
if (!$data) {
    echo json_encode([]);
    exit;
}

$json = json_decode($data, true);
$out = [];

foreach ($json["results"] as $p) {
    $out[] = [
        "title" => $p["collectionName"] ?? "",
        "artist" => $p["artistName"] ?? "",
        "artwork" => $p["artworkUrl600"] ?? "",
        "rss" => $p["feedUrl"] ?? "",
        "itunes_id" => $p["collectionId"] ?? "",
        "description" => $p["collectionName"] ?? "",
    ];
}

echo json_encode($out);
exit;
