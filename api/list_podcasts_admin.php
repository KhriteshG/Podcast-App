<?php
// api/list_podcasts_admin.php
require_once __DIR__ . '/admin_check.php';
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if (!$pdo) {
    // Fallback to JSON file
    $file = __DIR__ . '/../uploads/podcasts_fallback.json';
    $arr = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    echo json_encode($arr);
    exit;
}

try {
    $stmt = $pdo->query("SELECT PodcastID, Title, Description, ArtworkUrl FROM Podcasts ORDER BY CreatedAt DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
    exit;
} catch (Exception $e) {
    error_log('list_podcasts_admin error: ' . $e->getMessage());
    http_response_code(500); echo json_encode([]); exit;
}
