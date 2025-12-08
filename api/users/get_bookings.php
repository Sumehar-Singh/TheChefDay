<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config.php';

// Check if UserId is provided
$UserId = isset($_GET['UserId']) ? $_GET['UserId'] : (isset($_POST['UserId']) ? $_POST['UserId'] : '');
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 0; // Check if limit is provided, default is 0 (no limit)

// Check if UserId is empty
if (empty($UserId)) {
    echo json_encode(['status' => 'error', 'message' => 'UserId is required.']);
    exit();
}

// Prepare the SQL query to fetch bookings and chef details
$query = "
   SELECT 
    b.BookingID, 
    b.ServiceType, 
    b.EventDate, 
    b.Status, 
    b.BookingDate, 
    CONCAT_WS(' ', c.FirstName, c.MiddleName, c.LastName) AS ChefName, 
    c.Image AS ChefImage 
FROM Bookings b
LEFT JOIN Chefs c ON b.ChefID = c.ChefID
WHERE b.UserID = ? 
ORDER BY b.BookingID DESC
";

// If a limit is provided, append it to the query
if ($limit > 0) {
    $query .= " LIMIT ?";
}

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Database query preparation failed.']);
    exit();
}

// Bind parameters and execute
if ($limit > 0) {
    $stmt->bind_param('si', $UserId, $limit); // Binding UserId and limit if limit is provided
} else {
    $stmt->bind_param('s', $UserId); // Binding only UserId if no limit is provided
}

$stmt->execute();

// Bind result columns
$stmt->bind_result($BookingID, $ServiceType, $EventDate, $Status, $BookingDate, $ChefName, $ChefImage);

// Fetch data
$bookings = [];
while ($stmt->fetch()) {
    $bookings[] = [
        'BookingId' => $BookingID,
        'ServiceType' => $ServiceType,
        'EventDate' => $EventDate,
        'Status' => $Status,
        'BookingDate' => $BookingDate,
        'ChefName' => $ChefName,
        'ChefImage' => $ChefImage
    ];
}

// Close statement and connection
$stmt->close();
$connection->close();

// Return response
if (!empty($bookings)) {
    echo json_encode(['status' => 'success', 'data' => $bookings]);
} else {
    echo json_encode(['status' => 'success', 'message' => 'No bookings found.']);
}
?>
