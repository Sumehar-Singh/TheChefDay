<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../config.php";

// Prepare the SQL query to get all cuisines (no filtering on ChefPropertiesId)
$query = "SELECT Id, Name, UserPropertiesId FROM UserPreferences";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Execute the query
$stmt->execute();

// Bind result columns
$stmt->bind_result($Id, $Name, $UserPropertiesId);

// Fetch data
$cuisines = array();
while ($stmt->fetch()) {
    $cuisines[] = array(
        'Id' => $Id,
        'Name' => $Name,
        'UserPropertiesId' => $UserPropertiesId
    );
}

// Close statement and connection
$stmt->close();
$connection->close();

// Return response
if (!empty($cuisines)) {
    echo json_encode(array('status' => 'success', 'data' => $cuisines));
} else {
    echo json_encode(array('status' => 'error', 'message' => 'No specialities found.'));
}
?>
