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

if (!isset($_POST['ChefID']) || empty($_POST['ChefID'])) {
    echo json_encode(["success" => false, "message" => "ChefID is required"]);
    exit;
}

$ChefID = $_POST['ChefID'];

$sql = "SELECT HourlyRate, DayRate FROM ChefPricing WHERE ChefId = ?";
$stmt = $connection->prepare($sql);
$stmt->bind_param("s", $ChefID);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "data" => $row]);
} else {
    echo json_encode(["success" => false, "message" => "No pricing found"]);
}

$stmt->close();
$connection->close();
?>
