<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../config.php";

// Prepare the SQL query to get all chefs
$query = "SELECT ChefID, UserID, FirstName,MiddleName,LastName, Bio, ExperienceYears, Language, Image, Phone,Popularity,Lat,Lon,Address,PinCode FROM Chefs";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Execute the query
$stmt->execute();

// Bind result columns
$stmt->bind_result($ChefID, $UserID, $FirstName,$MiddleName,$LastName, $Bio, $ExperienceYears, $Language, $Image, $Phone,$Popularity,$Lat,$Lon,$Address,$PinCode);

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
        'Language' => $Language,
        'Image' => $Image,
        'Phone' => $Phone,
        'Popularity'=>$Popularity,
        'Lat'=>$Lat,
        'Lon'=>$Lon,
        'Address'=>$Address,
        'PinCode'=>$PinCode
    );
}

// Close statement and connection
$stmt->close();
$connection->close();

// Return response
if (!empty($chefs)) {
    echo json_encode(array('status' => 'success', 'data' => $chefs));
} else {
    echo json_encode(array('status' => 'error', 'message' => 'No chefs found.'));
}
?>
