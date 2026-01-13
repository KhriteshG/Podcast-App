<?php
// api/ingest_podcast.php
session_start();
require_once __DIR__ . "/config.php";
header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION["admin_id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Admin login required"]);
    exit;
}

$rss = $_POST["rss"] ?? "";
if ($rss === "") {
    http_response_code(400);
    echo json_encode(["error" => "RSS URL required"]);
    exit;
}

// Fetch parsed RSS data
$rssData = file_get_contents("https://yourdomain/api/fetch_rss.php?rss=" . urlencode($rss));
if (!$rssData) {
    echo json_encode(["error" => "RSS parser unavailable"]);
    exit;
}
$podJson = json_decode($rssData, true);

if (!$podJson) {
    echo json_encode(["error" => "Invalid RSS data"]);
    exit;
}

// Insert podcast
if ($pdo) {
    try {
        $sql = "INSERT INTO Podcasts (Title, Description, ArtworkUrl, RssUrl) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $podJson["title"],
            $podJson["description"],
            $podJson["artwork"],
            $rss
        ]);
        $podcastId = $pdo->lastInsertId();

        // Insert episodes
        $sqlE = "INSERT INTO Episodes (PodcastID, Title, Description, AudioUrl, PublishedAt) VALUES (?, ?, ?, ?, ?)";
        $stmtE = $pdo->prepare($sqlE);

        foreach ($podJson["episodes"] as $ep) {
            $stmtE->execute([
                $podcastId,
                $ep["title"],
                $ep["description"],
                $ep["audio"],
                date("Y-m-d H:i:s", strtotime($ep["pubDate"]))
            ]);
        }

        echo json_encode(["success" => true, "podcast_id" => $podcastId]);
        exit;

    } catch (Exception $e) {
        error_log("RSS ingest error: " . $e->getMessage());
        echo json_encode(["error" => "Database error"]);
        exit;
    }
}

echo json_encode(["error" => "Database unavailable"]);
