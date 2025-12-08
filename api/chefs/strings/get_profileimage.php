<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../../config.php"; 

// Check if UserId is provided (from GET or POST)
$UserId = isset($_GET['UserId']) ? $_GET['UserId'] : (isset($_POST['UserId']) ? $_POST['UserId'] : '');

if (empty($UserId)) {
    echo json_encode(array('status' => 'error', 'message' => 'UserId is required.'));
    exit();
}

// Prepare the SQL query
$query = "SELECT Image
          FROM Chefs WHERE ChefID = ?";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Bind parameters and execute
$stmt->bind_param("s", $UserId);
$stmt->execute();

// Bind result columns
$stmt->bind_result($Image);

// Fetch data
$users = array();
while ($stmt->fetch()) {
    $users[] = array(
        
        'Image' => $Image,
        
    );
}

// Close statement and connection
$stmt->close();
$connection->close();

// Return response
if (!empty($users)) {
    echo json_encode(array('status' => 'success', 'data' => $users));
} else {
    echo json_encode(array('status' => 'error', 'message' => 'No user found.'));
}
?>
