<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../config.php";

// Prepare the SQL query to get all subscription plans
$query = "SELECT Id, Duration, Price, Header, `Desc`, Recommended, Special FROM SubscriptionPlans ORDER BY Price ASC";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Execute the query
$stmt->execute();

// Bind result columns
$stmt->bind_result($Id, $Duration, $Price, $Header, $Desc, $Recommended, $Special);

// Fetch data
$plans = array();

while ($stmt->fetch()) {
    $plans[] = array(
        'Id' => $Id,
        'Duration' => $Duration,
        'Price' => $Price,
        'Header' => $Header,
        'Desc' => $Desc,
        'Recommended' => $Recommended,
        'Special' => $Special
    );
}

// Close statement and connection
$stmt->close();
$connection->close();

// Return response
if (!empty($plans)) {
    echo json_encode(array('status' => 'success', 'data' => $plans));
} else {
    echo json_encode(array('status' => 'error', 'message' => 'No subscription plans found.'));
}
?> 