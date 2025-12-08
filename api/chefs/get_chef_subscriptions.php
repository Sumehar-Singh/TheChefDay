<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config.php';

if (!$connection) {
    echo json_encode(["success" => false, "message" => "Database connection error"]);
    exit;
}

// Get ChefId from either GET or POST
$ChefId = $_GET['ChefId'] ?? $_POST['ChefId'] ?? null;

if (!$ChefId) {
    echo json_encode(["success" => false, "message" => "ChefId is required"]);
    exit;
}

// Prepare SQL to fetch subscriptions joined with plan details
$sql = "
    SELECT 
        s.Id AS SubscriptionId,
        s.ChefId,
        s.PlanId,
        s.SDate,
        s.EDate,
        p.Id AS PlanId,
        p.Duration,
        p.Price,
        p.Header,
        p.Desc AS Description,
        p.Recommended,
        p.Special
    FROM Subscriptions s
    INNER JOIN SubscriptionPlans p ON s.PlanId = p.Id
    WHERE s.ChefId = ?
    ORDER BY s.EDate DESC
";

$stmt = $connection->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Query prepare failed: " . $connection->error]);
    exit;
}

$stmt->bind_param("i", $ChefId);
$stmt->execute();

$result = $stmt->get_result();
$subscriptions = [];

while ($row = $result->fetch_assoc()) {
    $SDate = new DateTime($row['SDate']);
    $EDate = new DateTime($row['EDate']);
    $today = new DateTime();

    $totalDays = $SDate->diff($EDate)->days;
    $usedDays = $SDate->diff(min($today, $EDate))->days;
    $remainingDays = max($EDate->diff($today)->days * ($today < $EDate ? 1 : 0), 0);

    $price = floatval($row['Price']);
    $spent = ($totalDays > 0) ? round(($price / $totalDays) * $usedDays, 2) : 0.00;
    $remaining=$price-$spent;
    // Add calculated fields
    $row['SpentAmount'] = $spent;
    $row['RemainingAmount'] = $remaining;
    $row['RemainingDays'] = $remainingDays;

    $subscriptions[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $subscriptions
]);

$stmt->close();
$connection->close();
?>
