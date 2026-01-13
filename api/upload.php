<?php
// api/upload.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

// This endpoint expects a multipart form POST with 'file' and optional json metadata.
// NOTE: This is a minimal example. Validate file types, size, and implement auth in production.

$uploadDir = __DIR__ . '/../uploads';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Invalid method'], 405);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'No file uploaded or upload error'], 400);
}

$file = $_FILES['file'];
// Simple validation: allow common audio types (wav, mp3, m4a)
$allowed = ['audio/wav','audio/x-wav','audio/mpeg','audio/mp3','audio/x-m4a','audio/mp4'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowed)) {
    json_response(['error' => 'Unsupported file type: ' . $mime], 400);
}

// create safe filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$fname = uniqid('ep_') . '.' . $ext;
$target = $uploadDir . '/' . $fname;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    json_response(['error' => 'Failed to save uploaded file'], 500);
}

// In production: insert DB record, transcode if needed, generate streaming URL
$url = '/uploads/' . $fname;
json_response(['success' => true, 'url' => $url]);
