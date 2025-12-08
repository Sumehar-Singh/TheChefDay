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

// Get POST data
$Duration = isset($_POST['Duration']) ? $_POST['Duration'] : "";
$Price = isset($_POST['Price']) ? $_POST['Price'] : "";
$Header = isset($_POST['Header']) ? $_POST['Header'] : "";
$Desc = isset($_POST['Desc']) ? $_POST['Desc'] : "";
$Recommended = isset($_POST['Recommended']) ? $_POST['Recommended'] : "0";
$Special = isset($_POST['Special']) ? $_POST['Special'] : "0";

// Validate required fields
if (empty($Duration) || empty($Price) || empty($Header)) {
    echo json_encode(["success" => false, "message" => "Duration, Price, and Header are required fields"]);
    exit;
}

// Prepare the SQL query
$sql = "INSERT INTO SubscriptionPlans (Duration, Price, Header, `Desc`, Recommended, Special) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $connection->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Prepare Error: " . $connection->error]);
    exit;
}

// Bind parameters
$stmt->bind_param("sdssss", $Duration, $Price, $Header, $Desc, $Recommended, $Special);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Subscription plan added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add subscription plan: " . $stmt->error]);
}

$stmt->close();
$connection->close();
?> 