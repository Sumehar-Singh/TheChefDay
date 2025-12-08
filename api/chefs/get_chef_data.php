<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../config.php"; 

// Check if UserId is provided (from GET or POST)
$ChefID = isset($_GET['ChefID']) ? $_GET['ChefID'] : (isset($_POST['ChefID']) ? $_POST['ChefID'] : '');

if (empty($ChefID)) {
    echo json_encode(array('status' => 'error', 'message' => 'ChefID is required.'));
    exit();
}

// Prepare the SQL query
$query = "SELECT ChefID, UserID, FirstName,MiddleName,LastName, Bio, ExperienceYears, CuisineSpecialty, Pricing, CreatedAt, Language, Image, IsApproved, Phone, Address, Lat, Lon, PinCode
          FROM Chefs WHERE ChefID = ?";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Bind parameters and execute
$stmt->bind_param("s", $ChefID);
$stmt->execute();

// Bind result columns
$stmt->bind_result($ChefID, $UserID, $FirstName,$MiddleName,$LastName, $Bio, $ExperienceYears, $CuisineSpecialty, $Pricing, $CreatedAt, $Language, $Image, $IsApproved, $Phone, $Address, $Lat, $Lon, $PinCode);

// Fetch data
$chefs = array();
while ($stmt->fetch()) {
    $chefs[] = array(
        'ChefID' => $ChefID,
        'UserID' => $UserID,
        'FirstName' => $FirstName,
        'MiddleName' => $MiddleName,
        'LastName' => $LastName,
        'Bio' => $Bio,
        'ExperienceYears' => $ExperienceYears,
        'CuisineSpecialty' => $CuisineSpecialty,
        'Pricing' => $Pricing,
        'CreatedAt' => $CreatedAt,
        'Language' => $Language,
        'Image' => $Image,
        'IsApproved' => $IsApproved,
        'Phone' => $Phone,
        'Address' => $Address,
        'Lat' => $Lat,
        'Lon' => $Lon,
        'PinCode' => $PinCode
    );
}

// Close statement and connection
$stmt->close();
$connection->close();

// Return response
if (!empty($chefs)) {
    echo json_encode(array('status' => 'success', 'data' => $chefs));
} else {
    echo json_encode(array('status' => 'error', 'message' => 'No chef found.'));
}
?>
