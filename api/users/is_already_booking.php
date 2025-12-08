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

$requiredFields = ['UserID', 'ChefID', 'EventDate'];
foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit;
    }
}

$UserID = $_POST['UserID'];
$ChefID = $_POST['ChefID'];
$EventDate = $_POST['EventDate'];

$sql = "SELECT BookingID FROM Bookings WHERE UserID = ? AND ChefID = ? AND EventDate = ?";
$stmt = $connection->prepare($sql);
$stmt->bind_param("sss", $UserID, $ChefID, $EventDate);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["success" => true, "alreadyBooked" => true]);
} else {
    echo json_encode(["success" => true, "alreadyBooked" => false]);
}

$stmt->close();
$connection->close();
?>
