<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../config.php'; // DB connection

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ChefID'])) {
    $chefId = $_POST['ChefID'];
    $limit = isset($_POST['Limit']) ? intval($_POST['Limit']) : 0;

    // Base query
    $query = "
        SELECT 
            b.BookingID,
            b.BookingDate,
            b.EventDate,
            b.Status,
            CONCAT_WS(' ', u.FirstName, u.MiddleName, u.LastName) AS UserName
        FROM Bookings b
        JOIN Users u ON b.UserID = u.Id
        WHERE b.ChefID = ?
        ORDER BY b.BookingDate DESC
    ";

    // Append LIMIT if applicable
    if ($limit > 0) {
        $query .= " LIMIT ?";
        $stmt = $connection->prepare($query);
        $stmt->bind_param("si", $chefId, $limit); // "s" for ChefID, "i" for Limit
    } else {
        $stmt = $connection->prepare($query);
        $stmt->bind_param("s", $chefId); // Only ChefID
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $bookings = [];

        while ($row = $result->fetch_assoc()) {
            $bookings[] = $row;
        }

        $response['success'] = true;
        $response['data'] = $bookings;
    } else {
        $response['success'] = false;
        $response['message'] = "Failed to fetch bookings.";
    }

    $stmt->close();
} else {
    $response['success'] = false;
    $response['message'] = "Invalid request or missing ChefID.";
}

echo json_encode($response);
$connection->close();
?>
