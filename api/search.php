<?php
// api/search.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$q = isset($_GET['q']) ? trim($_GET['q']) : '';

if ($pdo && $q !== '') {
    try {
        // Parameterized query to avoid SQL injection
        if (strpos($pdo->getAttribute(PDO::ATTR_DRIVER_NAME), 'sqlsrv') !== false) {
            $sql = "SELECT PodcastID AS id, Title AS title, Description AS description, ArtworkUrl AS artwork, SampleAudioUrl AS audio FROM Podcasts WHERE Title LIKE ? OR Description LIKE ? ORDER BY CreatedAt DESC";
            $stmt = $pdo->prepare($sql);
            $like = '%' . $q . '%';
            $stmt->execute([$like, $like]);
            $rows = $stmt->fetchAll();
        } else {
            $sql = "SELECT PodcastID AS id, Title AS title, Description AS description, ArtworkUrl AS artwork, SampleAudioUrl AS audio FROM Podcasts WHERE Title LIKE ? OR Description LIKE ? ORDER BY CreatedAt DESC";
            $stmt = $pdo->prepare($sql);
            $like = '%' . $q . '%';
            $stmt->execute([$like, $like]);
            $rows = $stmt->fetchAll();
        }
        json_response($rows);
    } catch (Exception $e) {
        error_log("search.php DB error: " . $e->getMessage());
        // fallback
        $all = sample_podcasts($BASE_ASSET_PATH);
        $out = array_values(array_filter($all, function($p) use($q) {
            return stripos($p['title'], $q) !== false || stripos($p['description'], $q) !== false;
        }));
        json_response($out);
    }
} else {
    // fallback to sample data filter
    $all = sample_podcasts($BASE_ASSET_PATH);
    if ($q === '') {
        json_response($all);
    } else {
        $out = array_values(array_filter($all, function($p) use($q) {
            return stripos($p['title'], $q) !== false || stripos($p['description'], $q) !== false;
        }));
        json_response($out);
    }
}
