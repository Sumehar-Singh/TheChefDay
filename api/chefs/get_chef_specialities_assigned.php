<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../config.php"; 

// Get ChefId from request
$ChefId = isset($_GET['ChefId']) ? $_GET['ChefId'] : (isset($_POST['ChefId']) ? $_POST['ChefId'] : '');

if (empty($ChefId)) {
    echo json_encode(array('status' => 'error', 'message' => 'ChefId is required.'));
    exit();
}

// Prepare the SQL query to get the assigned specialities
$query = "SELECT SpecialityId FROM ChefSpecialityAssigneds WHERE ChefId = ?";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Bind parameters and execute
$stmt->bind_param("s", $ChefId);
$stmt->execute();

// Bind result columns
$stmt->bind_result($SpecialityId);

// Fetch data
$assignedSpecialities = array();
while ($stmt->fetch()) {
    $assignedSpecialities[] = $SpecialityId;
}

// Close statement and connection
$stmt->close();
$connection->close();

// Return response
echo json_encode(array('status' => 'success', 'data' => $assignedSpecialities));
?>
