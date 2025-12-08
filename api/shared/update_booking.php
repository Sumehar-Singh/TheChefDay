<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../config.php'; // DB connection

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['BookingID'], $_POST['Status'])) {
    $bookingId = $_POST['BookingID'];
    $status = $_POST['Status'];

    $query = "UPDATE Bookings SET Status = ? WHERE BookingID = ?";

    $stmt = $connection->prepare($query);
    $stmt->bind_param("ss", $status, $bookingId);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Booking status updated successfully.";
    } else {
        $response['success'] = false;
        $response['message'] = "Failed to update booking status.";
    }

    $stmt->close();
} else {
    $response['success'] = false;
    $response['message'] = "Invalid request or missing parameters.";
}

echo json_encode($response);
$connection->close();
?>
