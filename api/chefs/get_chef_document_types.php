<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../config.php'; // DB connection

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST body
    $input = json_decode(file_get_contents("php://input"), true);
    
    // Check if ChefId is provided
    if (!isset($input['ChefId'])) {
        $response['success'] = false;
        $response['message'] = "ChefId is required.";
        echo json_encode($response);
        exit;
    }

    $chefId = intval($input['ChefId']);

    // SQL with calculated column 'IsExists'
    $query = "
       SELECT 
    cdt.*,
    cd.File,cd.Status,cd.ReviewedDate,cd.UploadDate,cd.Id as DocumentTypeId,
    CASE 
        WHEN cd.Id IS NOT NULL THEN 1
        ELSE 0
    END AS IsExists
FROM ChefDocumentTypes cdt
LEFT JOIN ChefDocuments cd 
    ON cd.DocumentTypeId = cdt.Id AND cd.ChefId = ? ORDER BY cdt.IsRequired DESC
    ";

    $stmt = $connection->prepare($query);
    $stmt->bind_param("i", $chefId);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $docTypes = [];

        while ($row = $result->fetch_assoc()) {
            $docTypes[] = $row;
        }

        $response['success'] = true;
        $response['data'] = $docTypes;
    } else {
        $response['success'] = false;
        $response['message'] = "Failed to fetch document types.";
    }

    $stmt->close();
} else {
    $response['success'] = false;
    $response['message'] = "Invalid request method.";
}

echo json_encode($response);
$connection->close();
?>
