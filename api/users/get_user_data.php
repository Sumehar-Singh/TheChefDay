<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../config.php"; 

// Check if UserId is provided (from GET or POST)
$UserId = isset($_GET['UserId']) ? $_GET['UserId'] : (isset($_POST['UserId']) ? $_POST['UserId'] : '');

if (empty($UserId)) {
    echo json_encode(array('status' => 'error', 'message' => 'UserId is required.'));
    exit();
}

// Prepare the SQL query
$query = "SELECT Id, FirstName,MiddleName,LastName, Email, Phone,CreatedAt,UpdatedAt,Address,PinCode,Lat,Lon,UserId,Image
          FROM Users WHERE Id = ?";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Bind parameters and execute
$stmt->bind_param("s", $UserId);
$stmt->execute();

// Bind result columns
$stmt->bind_result($Id, $FirstName,$MiddleName,$LastName, $Email, $Phone, $CreatedAt, $UpdatedAt,$Address,$PinCode,$Lat,$Lon,$UID,$Image);

// Fetch data
$users = array();
while ($stmt->fetch()) {
    $users[] = array(
        'Id' => $Id,
        'UserID' => $UID,
        'FirstName' => $FirstName,
        'MiddleName' => $MiddleName,
        'LastName' => $LastName,
        'Email' => $Email,       
        'Image' => $Image,
        'Phone' => $Phone,
        'CreatedAt' => $CreatedAt,
        'Address' => $Address,
        'PinCode' => $PinCode,
        'Lat' => $Lat,
        'Lon' => $Lon
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
