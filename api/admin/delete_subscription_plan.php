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

// Decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Get the ID
$Id = isset($input['Id']) ? intval($input['Id']) : 0;

// Validate ID
if ($Id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid or missing plan ID"]);
    exit;
}

// Prepare the SQL query
$sql = "DELETE FROM SubscriptionPlans WHERE Id = ?";
$stmt = $connection->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Prepare Error: " . $connection->error]);
    exit;
}

// Bind the ID and execute
$stmt->bind_param("i", $Id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Subscription plan deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete plan: " . $stmt->error]);
}

$stmt->close();
$connection->close();
?>
