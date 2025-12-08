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

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['UserID']) || empty($input['UserID'])) {
    echo json_encode(["success" => false, "message" => "UserID is required"]);
    exit;
}

$UserID = $input['UserID'];

// Initialize counters
$reviews = 0;
$bookings = 0;



// 2. Check reviews
$reviewQuery = "SELECT COUNT(*) as count FROM Reviews WHERE UserID=?";
$stmt = $connection->prepare($reviewQuery);
$stmt->bind_param("i", $UserID);
$stmt->execute();
$result = $stmt->get_result();
$reviewData = $result->fetch_assoc();
$reviews = (int)$reviewData['count'];
$stmt->close();

// 3. Check bookings
$bookingQuery = "SELECT COUNT(*) AS count
FROM `Bookings`
WHERE UserID = ?
  AND Status IN ('Confirmed', 'Pending');
";
$stmt = $connection->prepare($bookingQuery);
$stmt->bind_param("i", $UserID);
$stmt->execute();
$result = $stmt->get_result();
$bookingData = $result->fetch_assoc();
$bookings = (int)$bookingData['count'];
$stmt->close();



// Determine if there is an alert
$isAlert = false;

if ($reviews > 0 || $bookings > 0) {
    $isAlert = true;
}

// Final Output
echo json_encode([
    "success" => true,
    "data" => [
       
        "reviews" => $reviews,
        "bookings" => $bookings,
        
        "isAlert" => $isAlert,
    ]
]);

$connection->close();
?>
