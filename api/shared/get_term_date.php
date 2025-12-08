<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../config.php'; // Include your DB connection

$response = array();

// Check for required GET parameters
if (isset($_GET['UserId'], $_GET['Role'])) {
    $userId = $_GET['UserId'];
    $role = $_GET['Role'];

    // Determine table and column based on role
    if ($role === 'Chef') {
        $query = "SELECT Terms_Accepted_At FROM Chefs WHERE ChefID = ?";
    } elseif ($role === 'User') {
        $query = "SELECT Terms_Accepted_At FROM Users WHERE Id = ?";
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Invalid role specified.';
        echo json_encode($response);
        exit;
    }

    // Prepare and execute the query
    $stmt = $connection->prepare($query);
    $stmt->bind_param("s", $userId);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            $response['status'] = 'success';
            $response['Terms_Accepted_At'] = $row['Terms_Accepted_At'];
        } else {
            $response['status'] = 'error';
            $response['message'] = 'User not found.';
        }
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Database query failed.';
    }

    $stmt->close();
} else {
    $response['status'] = 'error';
    $response['message'] = 'Missing parameters.';
}

echo json_encode($response);
$connection->close();
?>
