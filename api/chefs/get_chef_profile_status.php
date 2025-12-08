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

// Initialize flags
$location = false;
$pricing = false;
$specialities = false;
$subscribed = false;

// 1. Check location data
$locQuery = "SELECT PinCode, Lat, Lon 
FROM Chefs 
WHERE ChefID = ? 
  AND PinCode IS NOT NULL AND PinCode != ''
  AND Lat IS NOT NULL AND Lat != ''
  AND Lon IS NOT NULL AND Lon != ''
";
$stmt = $connection->prepare($locQuery);
$stmt->bind_param("i", $ChefID);
$stmt->execute();
$result = $stmt->get_result();
if ($result->fetch_assoc()) {
    $location = true;
}
$stmt->close();

// 2. Check pricing
$priceQuery = "SELECT HourlyRate, DayRate FROM ChefPricing WHERE ChefId = ? AND HourlyRate IS NOT NULL AND DayRate IS NOT NULL";
$stmt = $connection->prepare($priceQuery);
$stmt->bind_param("i", $ChefID);
$stmt->execute();
$result = $stmt->get_result();
if ($result->fetch_assoc()) {
    $pricing = true;
}
$stmt->close();

// 3. Check specialities in required ranges
$specialityQuery = "SELECT SpecialityId FROM ChefSpecialityAssigneds WHERE ChefId = ?";
$stmt = $connection->prepare($specialityQuery);
$stmt->bind_param("i", $ChefID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->fetch_assoc()) {
    $specialities = true;
}
$stmt->close();

// 4. Check subscription
$subQuery = "SELECT EDate FROM Subscriptions WHERE ChefId = ?";
$stmt = $connection->prepare($subQuery);
$stmt->bind_param("i", $ChefID);
$stmt->execute();
$result = $stmt->get_result();

$today = date("Y-m-d");
while ($row = $result->fetch_assoc()) {
    if ($row['EDate'] >= $today) {
        $subscribed = true;
        break;
    }
}
$stmt->close();

// Progress Calculation
$trueCount = 0;
if ($location) $trueCount++;
if ($pricing) $trueCount++;
if ($specialities) $trueCount++;
if ($subscribed) $trueCount++;

$progress = ($trueCount * 20) + 20; // Starts from 20%

// Cap at 100%
if ($progress > 100) $progress = 100;

// isprofilecompleted
$isprofilecompleted = ($trueCount === 4);

// Final Output
echo json_encode([
    "success" => true,
    "data" => [
        "location" => $location,
        "pricing" => $pricing,
        "specialities" => $specialities,
        "subscribed" => $subscribed,
        "progress" => $progress,
        "isprofilecompleted" => $isprofilecompleted
    ]
]);

$connection->close();
?>
