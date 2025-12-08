<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../../config.php"; 

// Check if UserID is provided (from GET or POST)
$UserID = isset($_GET['UserID']) ? $_GET['UserID'] : (isset($_POST['UserID']) ? $_POST['UserID'] : '');

if (empty($UserID)) {
    echo json_encode(array('status' => 'error', 'message' => 'UserID is required.'));
    exit();
}

// Prepare the SQL query
$query = "SELECT Lat, Lon FROM Users WHERE Id = ?";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Bind parameters and execute
$stmt->bind_param("s", $UserID);
$stmt->execute();

// Bind result columns
$stmt->bind_result($Lat, $Lon);

// Fetch data
if ($stmt->fetch()) {
    echo json_encode(array(
        'status' => 'success',
        'data' => array(
            'Lat' => $Lat,
            'Lon' => $Lon
        )
    ));
} else {
    echo json_encode(array('status' => 'error', 'message' => 'User not found.'));
}

// Close statement and connection
$stmt->close();
$connection->close();
?>
