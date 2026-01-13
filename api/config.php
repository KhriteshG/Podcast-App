<?php
header("Content-Type: application/json; charset=utf-8");
// Database config - update to your SQL Server instance
$DB_HOST = "DESKTOP-GC0IKK5";
$DB_NAME = "PodcastPlus";
$DB_USER = "PodcastPlusUser";
$DB_PASS = "Test1234";

// Podcast Index API base (used by some endpoints)
$PODCAST_INDEX_BASE = "https://api.podcastindex.org/api/1.0";

// JWT secret key
$JWT_SECRET = "REPLACE_WITH_RANDOM_SECRET";

// PDO connection (for auth + favorites)
function db() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    try {
        return new PDO(
            "sqlsrv:Server=$DB_HOST;Database=$DB_NAME;",
            $DB_USER,
            $DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    } catch(Exception $e){
        echo json_encode(["error" => "DB connection failed", "details"=>$e->getMessage()]);
        exit;
    }
}
?>