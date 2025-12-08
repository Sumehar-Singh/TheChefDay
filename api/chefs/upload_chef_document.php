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

// Validate required fields
if (!isset($_POST['ChefId']) || empty($_POST['ChefId'])) {
    echo json_encode(["success" => false, "message" => "ChefId is required!"]);
    exit;
}

if (!isset($_POST['DocumentTypeId']) || empty($_POST['DocumentTypeId'])) {
    echo json_encode(["success" => false, "message" => "DocumentTypeId is required!"]);
    exit;
}

$Id = isset($_POST['Id']) ? $_POST['Id'] : null;
$ChefId = $_POST['ChefId'];
$DocumentTypeId = $_POST['DocumentTypeId'];
$FilePath = null;
$Status = 1;// Under Review (By Default)

// Handle file upload if file is passed
if (isset($_FILES['File']) && $_FILES['File']['error'] == 0) {
    $uploadDir = '../../chefs/chefDocuments/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extension = pathinfo($_FILES['File']['name'], PATHINFO_EXTENSION);
    $fileName = "doc_" . $ChefId . "_" . time() . "." . $extension;
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['File']['tmp_name'], $targetPath)) {
        $FilePath = "https://thechefday.com/server/chef/chefs/chefDocuments/" . $fileName;
    } else {
        echo json_encode(["success" => false, "message" => "Failed to upload document"]);
        exit;
    }
}

// INSERT or UPDATE logic
if ($Id) {
    // UPDATE existing record
    if ($FilePath) {
        $sql = "UPDATE ChefDocuments SET DocumentTypeId=?, ChefId=?, File=?, Status=? WHERE Id=?";
        $stmt = $connection->prepare($sql);
        $stmt->bind_param("sssii", $DocumentTypeId, $ChefId, $FilePath, $Status, $Id);
    } else {
        $sql = "UPDATE ChefDocuments SET DocumentTypeId=?, ChefId=?, Status=? WHERE Id=?";
        $stmt = $connection->prepare($sql);
        $stmt->bind_param("ssii", $DocumentTypeId, $ChefId, $Status, $Id);
    }
} else {
    // INSERT new record
    if (!$FilePath) {
        echo json_encode(["success" => false, "message" => "Document file is required for insertion"]);
        exit;
    }

    $sql = "INSERT INTO ChefDocuments (DocumentTypeId, ChefId, File, Status) VALUES (?, ?, ?, ?)";
    $stmt = $connection->prepare($sql);
    $stmt->bind_param("sssi", $DocumentTypeId, $ChefId, $FilePath, $Status);
}

if ($stmt->execute()) {
    $responseId = $Id ? $Id : $stmt->insert_id;
    echo json_encode(["success" => true, "message" => $Id ? "Document updated successfully" : "Document uploaded successfully", "Id" => $responseId]);
} else {
    echo json_encode(["success" => false, "message" => "Database operation failed: " . $stmt->error]);
}

$stmt->close();
$connection->close();
?>
