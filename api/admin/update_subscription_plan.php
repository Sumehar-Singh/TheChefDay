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

// Extract and validate fields
$Id = isset($input['Id']) ? $input['Id'] : null;
$Duration = isset($input['Duration']) ? $input['Duration'] : "";
$Price = isset($input['Price']) ? $input['Price'] : "";
$Header = isset($input['Header']) ? $input['Header'] : "";
$Desc = isset($input['Desc']) ? $input['Desc'] : "";
$Recommended = (isset($input['Recommended']) && $input['Recommended'] == "1") ? 1 : 0;
$Special = (isset($input['Special']) && $input['Special'] == "1") ? 1 : 0;

// Validate required fields
if (empty($Id) || empty($Duration) || empty($Price) || empty($Header)) {
    echo json_encode(["success" => false, "message" => "Id, Duration, Price, and Header are required fields"]);
    exit;
}

// Prepare SQL query
$sql = "UPDATE SubscriptionPlans 
        SET Duration = ?, Price = ?, Header = ?, `Desc` = ?, Recommended = ?, Special = ?
        WHERE Id = ?";

$stmt = $connection->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Prepare Error: " . $connection->error]);
    exit;
}

// Bind parameters: sdssssi = string, double, string, string, string, string, integer
$stmt->bind_param("sdssiii", $Duration, $Price, $Header, $Desc, $Recommended, $Special, $Id);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Subscription plan updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update subscription plan: " . $stmt->error]);
}

$stmt->close();
$connection->close();
?>
