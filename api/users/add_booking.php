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

$requiredFields = ['UserID', 'ChefID', 'Name', 'PhoneNo', 'Address', 'PinCode', 'EventDate', 'ServiceType', 'TotalPrice'];

foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit;
    }
}

$UserID = $_POST['UserID'];
$ChefID = $_POST['ChefID'];
$Name = $_POST['Name'];
$PhoneNo = $_POST['PhoneNo'];
$Address = $_POST['Address'];
$PinCode = $_POST['PinCode'];

$EventDate = $_POST['EventDate'];
$ServiceType = $_POST['ServiceType'];
$TotalPrice = $_POST['TotalPrice'];
$BookingDate = date('Y-m-d'); // Current Date
$Status = "Pending"; // Default Status

$sql = "INSERT INTO Bookings (UserID, ChefID, Name, PhoneNo, Address, PinCode, BookingDate, EventDate, ServiceType, Status, TotalPrice) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $connection->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Prepare Error: " . $connection->error]);
    exit;
}

$stmt->bind_param("iissssssssi", $UserID, $ChefID, $Name, $PhoneNo, $Address, $PinCode, $BookingDate, $EventDate, $ServiceType, $Status, $TotalPrice);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Booking added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$connection->close();
?>
