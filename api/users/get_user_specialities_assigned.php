<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../config.php"; 

// Get ChefId from request
$UserId = isset($_GET['UserId']) ? $_GET['UserId'] : (isset($_POST['UserId']) ? $_POST['UserId'] : '');

if (empty($UserId)) {
    echo json_encode(array('status' => 'error', 'message' => 'UserId is required.'));
    exit();
}

// Prepare the SQL query to get the assigned specialities
$query = "SELECT PreferenceId FROM UserPreferenceAssigneds WHERE UserId = ?";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Bind parameters and execute
$stmt->bind_param("s", $UserId);
$stmt->execute();

// Bind result columns
$stmt->bind_result($PreferenceId);

// Fetch data
$assignedSpecialities = array();
while ($stmt->fetch()) {
    $assignedSpecialities[] = $PreferenceId;
}

// Close statement and connection
$stmt->close();
$connection->close();

// Return response
echo json_encode(array('status' => 'success', 'data' => $assignedSpecialities));
?>
