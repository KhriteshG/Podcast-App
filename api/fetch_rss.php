<?php
// api/fetch_rss.php
header("Content-Type: application/json; charset=utf-8");

$rss = $_GET["rss"] ?? "";
if ($rss === "") {
    echo json_encode(["error" => "Missing RSS URL"]);
    exit;
}

$rssData = @file_get_contents($rss);
if (!$rssData) {
    echo json_encode(["error" => "Could not fetch RSS"]);
    exit;
}

$xml = @simplexml_load_string($rssData, "SimpleXMLElement", LIBXML_NOCDATA);
if (!$xml) {
    echo json_encode(["error" => "RSS parsing failed"]);
    exit;
}

$channel = $xml->channel;

$podcast = [
    "title" => (string)$channel->title,
    "description" => (string)$channel->description,
    "artwork" => (string)($channel->image->url ?? ""),
    "episodes" => []
];

foreach ($channel->item as $item) {
    $enclosure = $item->enclosure['url'] ?? "";
    $podcast["episodes"][] = [
        "title" => (string)$item->title,
        "description" => (string)$item->description,
        "audio" => (string)$enclosure,
        "pubDate" => (string)$item->pubDate,
    ];
}

echo json_encode($podcast);
exit;
