<?php
// api/episodes.php?podcast_id=1
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$podcast_id = isset($_GET['podcast_id']) ? (int)$_GET['podcast_id'] : 0;

if ($pdo) {
    try {
        if ($podcast_id > 0) {
            $sql = "SELECT EpisodeID AS id, PodcastID AS podcast_id, Title AS title, Description AS description, AudioUrl AS audio, DurationSec AS duration FROM Episodes WHERE PodcastID = ? ORDER BY PublishedAt DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$podcast_id]);
            $rows = $stmt->fetchAll();
        } else {
            $sql = "SELECT EpisodeID AS id, PodcastID AS podcast_id, Title AS title, Description AS description, AudioUrl AS audio, DurationSec AS duration FROM Episodes ORDER BY PublishedAt DESC";
            $stmt = $pdo->query($sql);
            $rows = $stmt->fetchAll();
        }
        json_response($rows);
    } catch (Exception $e) {
        error_log("episodes.php DB error: " . $e->getMessage());
        json_response([]);
    }
} else {
    json_response([]);
}
