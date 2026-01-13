<?php
// api/podcasts.php
require_once __DIR__ . "/config.php";
require_once __DIR__ . "/helpers.php";

header("Content-Type: application/json; charset=utf-8");

// base path for assets
$BASE_ASSET_PATH = "/assets";

// Get DB connection properly (your config uses db() function)
$pdo = db();

try {
    $sql = "
        SELECT 
            PodcastID AS id,
            Title AS title,
            Description AS description,
            ArtworkUrl AS artwork,
            SampleAudioUrl AS audio
        FROM Podcasts
        ORDER BY PodcastID DESC
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // fix missing fields
    foreach ($rows as &$r) {
        if (!$r["artwork"]) {
            $r["artwork"] = $BASE_ASSET_PATH . "/icons/podcast-placeholder.svg";
        }
        if (!$r["audio"]) {
            $r["audio"] = $BASE_ASSET_PATH . "/audio/silence.wav";
        }
    }

    json_response($rows);
    exit;

} catch (Exception $e) {
    error_log("podcasts.php error: " . $e->getMessage());
    json_response(sample_podcasts($BASE_ASSET_PATH));
    exit;
}


