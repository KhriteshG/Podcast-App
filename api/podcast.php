<?php
// api/podcast.php?id=123
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    json_response(['error' => 'Missing podcast id'], 400);
}

if ($pdo) {
    try {
        // Fetch podcast
        $sqlP = "SELECT PodcastID AS id, Title AS title, Description AS description, ArtworkUrl AS artwork FROM Podcasts WHERE PodcastID = ?";
        $stmtP = $pdo->prepare($sqlP);
        $stmtP->execute([$id]);
        $pod = $stmtP->fetch();
        if (!$pod) {
            json_response(['error' => 'Podcast not found'], 404);
        }

        // Fetch episodes (if table exists)
        $sqlE = "SELECT EpisodeID AS id, Title AS title, Description AS description, AudioUrl AS audio, DurationSec AS duration FROM Episodes WHERE PodcastID = ? ORDER BY PublishedAt DESC";
        $stmtE = $pdo->prepare($sqlE);
        $stmtE->execute([$id]);
        $episodes = $stmtE->fetchAll();

        $pod['episodes'] = $episodes;
        json_response($pod);

    } catch (Exception $e) {
        error_log("podcast.php DB error: " . $e->getMessage());
        // Fallback minimal response
        json_response(['id'=>$id, 'title'=>'Sample Podcast', 'description'=>'Fallback', 'artwork'=>"$BASE_ASSET_PATH/icons/podcast-placeholder.svg", 'episodes'=>[]]);
    }
} else {
    // Fallback sample
    json_response(['id'=>$id, 'title'=>'Sample Podcast', 'description'=>'Fallback - DB not connected', 'artwork'=>"$BASE_ASSET_PATH/icons/podcast-placeholder.svg", 'episodes'=>[]]);
}
