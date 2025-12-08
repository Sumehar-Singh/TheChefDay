<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include_once "../config.php";

// Get the UserID from request
$UserID = isset($_GET['UserID']) ? $_GET['UserID'] : (isset($_POST['UserID']) ? $_POST['UserID'] : '');

if (empty($UserID)) {
    echo json_encode(array('status' => 'error', 'message' => 'UserID is required.'));
    exit();
}

// Prepare the SQL query to get all chefs with Booked column
$query = "
  SELECT 
    ChefID,
    UserID,
    FirstName,
    MiddleName,
    LastName,
    Bio,
    ExperienceYears,
    Language,
    Image,
    Phone,
    Popularity,
    Lat,
    Lon,
    Address,
    PinCode,
    (
        SELECT COUNT(*) 
        FROM Bookings 
        WHERE Bookings.ChefID = Chefs.ChefID AND Bookings.UserID = ?
    ) AS Booked,
    (
        SELECT HourlyRate
        FROM ChefPricing 
        WHERE ChefPricing.ChefID = Chefs.ChefID
    ) AS HourlyRate,
    (
        SELECT DayRate
        FROM ChefPricing 
        WHERE ChefPricing.ChefID = Chefs.ChefID
    ) AS DayRate
FROM Chefs
WHERE Lat IS NOT NULL AND Lon IS NOT NULL AND Lat != '' AND Lon != ''


";

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(array('status' => 'error', 'message' => 'Database query preparation failed.'));
    exit();
}

// Bind the UserID to the subquery
$stmt->bind_param("s", $UserID);
$stmt->execute();

// Bind result columns
$stmt->bind_result(
    $ChefID, $ChefUserID, $FirstName, $MiddleName, $LastName, $Bio, $ExperienceYears, $Language,
    $Image, $Phone, $Popularity, $Lat, $Lon, $Address, $PinCode, $BookedCount,$HourlyRate,$DayRate
);

// Fetch data
$chefs = array();

while ($stmt->fetch()) {
    $chefs[] = array(
        'ChefID' => $ChefID,
        'UserID' => $ChefUserID,
        'FirstName' => $FirstName,
        'MiddleName' => $MiddleName,
        'LastName' => $LastName,
        'Bio' => $Bio,
        'ExperienceYears' => $ExperienceYears,
        'Language' => $Language,
        'Image' => $Image,
        'Phone' => $Phone,
        'Popularity' => $Popularity,
        'Lat' => $Lat,
        'Lon' => $Lon,
        'Address' => $Address,
        'PinCode' => $PinCode,
        'HourlyRate' => $HourlyRate,
        'DayRate' => $DayRate,
        'Booked' => $BookedCount > 0 ? true : false
    );
}

// Close resources
$stmt->close();
$connection->close();

// Return response
if (!empty($chefs)) {
    echo json_encode(array('status' => 'success', 'data' => $chefs));
} else {
    echo json_encode(array('status' => 'error', 'message' => 'No chefs found.'));
}
?>
