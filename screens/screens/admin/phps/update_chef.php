<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../config.php'; 


if (!$connection) {
    echo json_encode(["success" => false, "message" => "Database connection error"]);
    exit;
}


if (!isset($_POST['UserId']) || empty($_POST['UserId'])) {
    echo json_encode(["success" => false, "message" => "UserId is required!"]);
    exit;
}

$UserId = $_POST['UserId'];
$FirstName = isset($_POST['FirstName']) ? $_POST['FirstName'] : "";
$MiddleName = isset($_POST['MiddleName']) ? $_POST['MiddleName'] : "";
$LastName = isset($_POST['LastName']) ? $_POST['LastName'] : "";
$Bio = isset($_POST['Bio']) ? $_POST['Bio'] : "";
$Experience = isset($_POST['Experience']) ? $_POST['Experience'] : "";
$Phone = isset($_POST['Phone']) ? $_POST['Phone'] : "";
$Address = isset($_POST['Address']) ? $_POST['Address'] : "";
$Lat = isset($_POST['Lat']) ? $_POST['Lat'] : "";
$Lon = isset($_POST['Lon']) ? $_POST['Lon'] : "";
$PinCode = isset($_POST['PinCode']) ? $_POST['PinCode'] : "";
$IsImageRemoved = isset($_POST['IsImageRemoved']) ? $_POST['IsImageRemoved'] : "No"; 
// Get selected specialities
$SelectedSpecialities = isset($_POST['SelectedSpecialities']) ? json_decode($_POST['SelectedSpecialities']) : [];
$ProfileImage = null;

if($IsImageRemoved==="No"){

if (isset($_FILES['ProfileImage']) && $_FILES['ProfileImage']['error'] == 0) {
    $uploadDir = '../../images/chefs/';
    $fileName = "chef_" . $UserId . "_" . time() . "." . pathinfo($_FILES['ProfileImage']['name'], PATHINFO_EXTENSION);
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['ProfileImage']['tmp_name'], $targetPath)) {
        $ProfileImage = "http://192.168.1.11:8080/chef/server/images/chefs/" . $fileName;
    } else {
        echo json_encode(["success" => false, "message" => "Failed to upload image"]);
        exit;
    }
}}

$sql = "UPDATE Chefs SET FirstName=?,MiddleName=?,LastName=?, Bio=?, ExperienceYears=?, Phone=?, Address=?, Lat=?, Lon=?, PinCode=?";
if ($ProfileImage) {
   $sql .= ", Image=?";
}
if($IsImageRemoved==="Yes")
{
   $sql .= ", Image=?";
}
$sql .= " WHERE ChefID=?";

$stmt = $connection->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Prepare Error: " . $connection->error]);
    exit;
}

if ($ProfileImage) {
   $stmt->bind_param("ssssssssssss", $FirstName,$MiddleName,$LastName, $Bio, $Experience, $Phone, $ProfileImage, $UserId,$Address,$Lat,$Lon,$PinCode);
} else {
    if($IsImageRemoved==="Yes")
    {
     
        $ProfileImage=null;
        $stmt->bind_param("sssssssssss", $FirstName,$MiddleName,$LastName, $Bio, $Experience, $Phone, $Address, $Lat, $Lon, $PinCode, $UserId);
    }
    else{
        
        $stmt->bind_param("sssssssssss", $FirstName,$MiddleName,$LastName, $Bio, $Experience, $Phone, $Address, $Lat, $Lon, $PinCode, $UserId);

    }
}

if ($stmt->execute()) {
    // Clear old assigned specialities before inserting new ones
    $deleteSql = "DELETE FROM ChefSpecialityAssigned WHERE ChefId = ?";
    $deleteStmt = $connection->prepare($deleteSql);
    $deleteStmt->bind_param("s", $UserId);
    $deleteStmt->execute();

    // Insert new assigned specialities
    foreach ($SelectedSpecialities as $specialityId) {
        $insertSql = "INSERT INTO ChefSpecialityAssigned (ChefId, SpecialityId) VALUES (?, ?)";
        $insertStmt = $connection->prepare($insertSql);
        $insertStmt->bind_param("si", $UserId, $specialityId);
        $insertStmt->execute();
    }

    echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Update failed: " . $stmt->error]);
}

$stmt->close();
$connection->close();
?>
