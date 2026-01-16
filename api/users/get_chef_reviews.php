<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../config.php'; // database connection

$response = array();

// Check if ChefID is provided
$chefId = isset($_GET['ChefID']) ? $_GET['ChefID'] : (isset($_POST['ChefID']) ? $_POST['ChefID'] : '');
$limit = isset($_GET['Limit']) ? (int) $_GET['Limit'] : (isset($_POST['Limit']) ? (int) $_POST['Limit'] : 0);
$offset = isset($_GET['Offset']) ? (int) $_GET['Offset'] : (isset($_POST['Offset']) ? (int) $_POST['Offset'] : 0);

// Check if ChefID is empty
if (empty($chefId)) {
    echo json_encode(['status' => 'error', 'message' => 'ChefID is required.']);
    exit();
}

// Prepare the SQL query to fetch reviews
$query = "SELECT 
  r.ReviewText, 
  r.Rating, 
  r.CreatedAt,
  r.UserID,
  r.ReviewID,
  COALESCE(NULLIF(TRIM(CONCAT_WS(' ', u.FirstName, NULLIF(u.MiddleName, ''), u.LastName)), ''), 'Deleted User') AS UserName,
  u.Image
 
FROM Reviews r
LEFT JOIN Users u ON r.UserID = u.Id
WHERE r.ChefID = ? 
  AND r.IsActive = 1
ORDER BY r.ReviewID DESC";

// If a limit is provided, append it to the query
if ($limit > 0) {
    $query .= " LIMIT ? OFFSET ?";
}

$stmt = $connection->prepare($query);

if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Database query preparation failed.']);
    exit();
}

// Bind parameters and execute
if ($limit > 0) {
    $stmt->bind_param('sii', $chefId, $limit, $offset);
} else {
    $stmt->bind_param('s', $chefId);
}

$stmt->execute();

// Bind result columns
$stmt->bind_result($ReviewText, $Rating, $CreatedAt, $UserID, $ReviewID, $UserName, $Image);

// Fetch data
$reviews = [];
while ($stmt->fetch()) {
    $reviews[] = [
        'ReviewText' => $ReviewText,
        'Rating' => $Rating,
        'CreatedAt' => $CreatedAt,
        'UserName' => $UserName,
        'UserImage' => $Image, // Frontend expects UserImage or Image
        'UserID' => $UserID,
        'ReviewID' => $ReviewID
    ];
}

// Close statement and connection
$stmt->close();

// Return response
if (!empty($reviews)) {
    echo json_encode(['status' => 'success', 'success' => true, 'data' => $reviews]);
} else {
    echo json_encode(['status' => 'success', 'success' => true, 'message' => 'No reviews found.']);
}

$connection->close();
?>