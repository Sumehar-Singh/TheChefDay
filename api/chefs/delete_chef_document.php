<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../config.php'; // DB connection

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read raw POST body
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['Id'])) {
        $response['success'] = false;
        $response['message'] = "Document Id is required.";
        echo json_encode($response);
        exit;
    }

    $documentId = intval($input['Id']);

    $query = "DELETE FROM ChefDocuments WHERE Id = ?";
    $stmt = $connection->prepare($query);
    $stmt->bind_param("i", $documentId);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = "Document deleted successfully.";
        } else {
            $response['success'] = false;
            $response['message'] = "No document found with the given Id.";
        }
    } else {
        $response['success'] = false;
        $response['message'] = "Failed to delete document.";
    }

    $stmt->close();
} else {
    $response['success'] = false;
    $response['message'] = "Invalid request method.";
}

echo json_encode($response);
$connection->close();
?>
