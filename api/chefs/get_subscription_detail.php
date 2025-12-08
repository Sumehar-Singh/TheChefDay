<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once "../config.php";

if (!isset($_GET['Id'])) {
    echo json_encode(["success" => false, "message" => "Missing subscription Id"]);
    exit;
}

$Id = $_GET['Id'];

$query = "SELECT Id, Header, Price, Duration, `Desc`, Recommended, Special FROM subscriptionplans WHERE Id = ?";
$stmt = $connection->prepare($query);
$stmt->bind_param("i", $Id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $plan = $result->fetch_assoc();
    echo json_encode(["status" => "success", "data" => $plan]);
} else {
    echo json_encode(["success" => false, "message" => "Subscription plan not found"]);
}

$stmt->close();
$connection->close();
?>
