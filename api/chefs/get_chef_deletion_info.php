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

if (!isset($input['ChefID']) || empty($input['ChefID'])) {
    echo json_encode(["success" => false, "message" => "ChefID is required"]);
    exit;
}

$ChefID = $input['ChefID'];

// Initialize counters
$documents = 0;
$reviews = 0;
$bookings = 0;
$subscriptions = 0;

// 1. Check documents data
$docQuery = "SELECT COUNT(*) as count FROM ChefDocuments WHERE ChefId=?";
$stmt = $connection->prepare($docQuery);
$stmt->bind_param("i", $ChefID);
$stmt->execute();
$result = $stmt->get_result();
$docData = $result->fetch_assoc();
$documents = (int)$docData['count'];
$stmt->close();

// 2. Check reviews
$reviewQuery = "SELECT COUNT(*) as count FROM Reviews WHERE ChefID=?";
$stmt = $connection->prepare($reviewQuery);
$stmt->bind_param("i", $ChefID);
$stmt->execute();
$result = $stmt->get_result();
$reviewData = $result->fetch_assoc();
$reviews = (int)$reviewData['count'];
$stmt->close();

// 3. Check bookings
$bookingQuery = "SELECT COUNT(*) AS count
FROM `Bookings`
WHERE ChefId = ?
  AND Status IN ('Confirmed', 'Pending');
";
$stmt = $connection->prepare($bookingQuery);
$stmt->bind_param("i", $ChefID);
$stmt->execute();
$result = $stmt->get_result();
$bookingData = $result->fetch_assoc();
$bookings = (int)$bookingData['count'];
$stmt->close();

// 4. Check subscriptions
$subQuery = "SELECT COUNT(*) as count FROM Subscriptions WHERE ChefId=?";
$stmt = $connection->prepare($subQuery);
$stmt->bind_param("i", $ChefID);
$stmt->execute();
$result = $stmt->get_result();
$subData = $result->fetch_assoc();
$subscriptions = (int)$subData['count'];
$stmt->close();

// Determine if there is an alert
$isAlert = false;

if ($documents > 0 || $reviews > 0 || $bookings > 0 || $subscriptions > 0) {
    $isAlert = true;
}

// Final Output
echo json_encode([
    "success" => true,
    "data" => [
        "documents" => $documents,
        "reviews" => $reviews,
        "bookings" => $bookings,
        "subscriptions" => $subscriptions,
        "isAlert" => $isAlert,
    ]
]);

$connection->close();
?>
