<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization');
header('Content-Type: application/json');

include_once "config.php"; 

// Read incoming JSON
$inputData = json_decode(file_get_contents('php://input'), true);

$app_user_id = isset($inputData['app_user_id']) ? $connection->real_escape_string($inputData['app_user_id']) : '';
$user_id = isset($inputData['user_id']) ? (int)$inputData['user_id'] : 0;
$roleId = isset($inputData['role_id']) ? (int)$inputData['role_id'] : 0;

if (empty($app_user_id) || empty($user_id)) {
    echo json_encode(array('success' => false, 'message' => 'User ID and Role ID are required.'));
    exit();
}

// --- Step 1: Check if user exists ---
$checkUserQuery = "SELECT Id FROM AppUsers WHERE Id = '$app_user_id'";
$result = $connection->query($checkUserQuery);

if ($result->num_rows == 0) {
    echo json_encode(array('success' => false, 'message' => 'User not found.'));
    exit();
}


// --- Step 2: Delete data from all related tables ---
try {
    $connection->begin_transaction();

    
    // Delete from role-specific table
    if ($roleId == 2) {
        // Normal User
        $connection->query("DELETE FROM Users WHERE Id = '$userId'");
    } elseif ($roleId == 3) {
        // Chef
        $connection->query("DELETE FROM Chefs WHERE ChefID = '$userId'");
    }

    // Delete from UserRolesManagers
    $connection->query("DELETE FROM UserRolesManagers WHERE UserId = '$app_user_id'");

    // Finally delete from AppUsers
    $connection->query("DELETE FROM AppUsers WHERE Id = '$app_user_id'");

    $connection->commit();

    // --- Step 4: Response ---
  
        echo json_encode(array(
           'success' => true,
            'message' => 'User account and all related data deleted successfully.'
        ));
   

} catch (Exception $e) {
    $connection->rollback();
    echo json_encode(array('success' => false, 'message' => 'Error deleting user: ' . $e->getMessage()));
}

$connection->close();
?>
