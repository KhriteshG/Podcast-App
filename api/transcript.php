<?php
// api/transcript.php?episode_id=123
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$episode_id = isset($_GET['episode_id']) ? (int)$_GET['episode_id'] : 0;

if ($episode_id <= 0) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['transcript' => null]);
    exit;
}

if ($pdo) {
    try {
        // Attempt to read a Transcript column from Episodes (optional column)
        $sql = "SELECT Transcript FROM Episodes WHERE EpisodeID = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$episode_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && !empty($row['Transcript'])) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['transcript' => $row['Transcript']]);
            exit;
        }
    } catch (Exception $e) {
        error_log("transcript.php error: " . $e->getMessage());
    }
}

// Fallback: return a tiny placeholder or static sample text
$sample = "Transcript unavailable for this episode. To enable transcripts, run a speech-to-text job (AssemblyAI, Whisper, Google Speech-to-Text) and store the result in the Episodes.Transcript column.";

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['transcript' => $sample]);
exit;
