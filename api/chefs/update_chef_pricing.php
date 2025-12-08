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

$requiredFields = ['ChefID', 'HourlyRate', 'DayRate'];

foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit;
    }
}

$ChefID = $_POST['ChefID'];
$HourlyRate = $_POST['HourlyRate'];
$DayRate = $_POST['DayRate'];

// Check if entry already exists
$checkSql = "SELECT Id FROM ChefPricing WHERE ChefId = ?";
$checkStmt = $connection->prepare($checkSql);
$checkStmt->bind_param("s", $ChefID);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    // Update existing row
    $updateSql = "UPDATE ChefPricing SET HourlyRate = ?, DayRate = ? WHERE ChefId = ?";
    $updateStmt = $connection->prepare($updateSql);
    $updateStmt->bind_param("dds", $HourlyRate, $DayRate, $ChefID);

    if ($updateStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Pricing updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed: " . $updateStmt->error]);
    }

    $updateStmt->close();
} else {
    // Insert new row
    $insertSql = "INSERT INTO ChefPricing (ChefId, HourlyRate, DayRate) VALUES (?, ?, ?)";
    $insertStmt = $connection->prepare($insertSql);
    $insertStmt->bind_param("sdd", $ChefID, $HourlyRate, $DayRate);

    if ($insertStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Pricing added successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Insert failed: " . $insertStmt->error]);
    }

    $insertStmt->close();
}

$checkStmt->close();
$connection->close();
?>
