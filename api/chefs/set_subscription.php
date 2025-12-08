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

// Get raw JSON input
$data = json_decode(file_get_contents("php://input"), true);

$requiredFields = ['ChefId', 'PlanId', 'SDate', 'EDate'];

foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit;
    }
}

$ChefId = $data['ChefId'];
$PlanId = $data['PlanId'];
$SDate = $data['SDate'];
$EDate = $data['EDate'];

$insertSql = "INSERT INTO Subscriptions (ChefId, PlanId, SDate, EDate) VALUES (?, ?, ?, ?)";
$insertStmt = $connection->prepare($insertSql);

if (!$insertStmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $connection->error]);
    exit;
}

$insertStmt->bind_param("iiss", $ChefId, $PlanId, $SDate, $EDate);

if ($insertStmt->execute()) {
    echo json_encode(["success" => true, "message" => "Subscription added successfully", "SubscriptionId" => $insertStmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Insert failed: " . $insertStmt->error]);
}

$insertStmt->close();
$connection->close();
