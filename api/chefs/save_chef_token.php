<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config.php';

if (!$connection) {
    echo json_encode(["success" => false, "message" => "Database connection error"]);
    exit;
}

$requiredFields = ['ChefID', 'PushToken'];

foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit;
    }
}

$ChefID = $_POST['ChefID'];
$PushToken = $_POST['PushToken'];

$updateSql = "UPDATE Chefs SET PushToken = ? WHERE ChefID = ?";
$updateStmt = $connection->prepare($updateSql);
$updateStmt->bind_param("ss", $PushToken, $ChefID);

if ($updateStmt->execute()) {
    echo json_encode(["success" => true, "message" => "Push token saved successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Update failed: " . $updateStmt->error]);
}

$updateStmt->close();
$connection->close();
?>
