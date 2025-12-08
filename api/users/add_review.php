<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../config.php'; // database connection

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ChefID'], $_POST['UserID'], $_POST['Rating'], $_POST['ReviewText'])) {
    $chefId = $_POST['ChefID'];
    $userId = $_POST['UserID'];
    $rating = $_POST['Rating'];
    $reviewText = $_POST['ReviewText'];

    // Step 1: Check for existing review
    $checkQuery = "SELECT ReviewID FROM Reviews WHERE ChefID = ? AND UserID = ?";
    $checkStmt = $connection->prepare($checkQuery);
    $checkStmt->bind_param("ss", $chefId, $userId);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        // Review already exists
        $response['success'] = false;
        $response['message'] = "You have already submitted a review for this chef.";
    } else {
        // Step 2: Insert new review
        $insertQuery = "INSERT INTO Reviews (ChefID, UserID, Rating, ReviewText, CreatedAt, Email, IsActive)
                        VALUES (?, ?, ?, ?, NOW(), NULL, 1)";
        $insertStmt = $connection->prepare($insertQuery);
        $insertStmt->bind_param("ssis", $chefId, $userId, $rating, $reviewText);

        if ($insertStmt->execute()) {
            $response['success'] = true;
            $response['message'] = "Review submitted successfully.";
        } else {
            $response['success'] = false;
            $response['message'] = "Failed to submit review.";
        }
        $insertStmt->close();
    }

    $checkStmt->close();
} else {
    $response['success'] = false;
    $response['message'] = "Missing required fields.";
}

echo json_encode($response);
$connection->close();
?>
