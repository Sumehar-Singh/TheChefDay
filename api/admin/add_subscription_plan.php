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

$input = json_decode(file_get_contents("php://input"), true);

$Duration = isset($input['Duration']) ? $input['Duration'] : "";
$Price = isset($input['Price']) ? $input['Price'] : "";
$Header = isset($input['Header']) ? $input['Header'] : "";
$Desc = isset($input['Desc']) ? $input['Desc'] : "";
$Recommended = (isset($input['Recommended']) && $input['Recommended'] == "1") ? 1 : 0;
$Special = (isset($input['Special']) && $input['Special'] == "1") ? 1 : 0;



// Validate required fields
if (empty($Duration) || empty($Price) || empty($Header)) {
    echo json_encode(["success" => false, "message" => "Duration, Price, and Header are required fields","rec"=>$Recommended,"spec"=>$Special]);
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
$stmt->bind_param("sdssii", $Duration, $Price, $Header, $Desc, $Recommended, $Special);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Subscription plan added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add subscription plan: " . $stmt->error]);
}

$stmt->close();
$connection->close();
?> 