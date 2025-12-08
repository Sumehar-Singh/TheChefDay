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

if (!isset($_POST['BookingID']) || empty($_POST['BookingID'])) {
    echo json_encode(["success" => false, "message" => "BookingID is required"]);
    exit;
}

$BookingID = $_POST['BookingID'];

$sql = "SELECT b.*, u.Image 
        FROM Bookings b 
        LEFT JOIN Users u ON b.UserID = u.UserId
        WHERE b.BookingID = ?";

$stmt = $connection->prepare($sql);
$stmt->bind_param("i", $BookingID);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "data" => $row]);
} else {
    echo json_encode(["success" => false, "message" => "Booking not found"]);
}

$stmt->close();
$connection->close();
?>
