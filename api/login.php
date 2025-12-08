<?php
header('Access-Control-Allow-Origin:*');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization');

include_once "config.php"; 



function encrypt($password, $key)
{
    $encrypted = "";
    for ($i = 0; $i < strlen($password); $i++) {
        $encrypted .= chr(ord($password[$i]) ^ ord($key[$i % strlen($key)]));
    }
    return base64_encode($encrypted); 
}


$inputData = json_decode(file_get_contents('php://input'), true);


error_log('Received JSON: ' . print_r($inputData, true));


$email = isset($inputData['email']) ? $inputData['email'] : '';
$password = isset($inputData['password']) ? $inputData['password'] : '';

if (empty($email) || empty($password)) {
    echo json_encode(array('status' => 'error', 'message' => 'Email or Password is missing.'));
    exit();
}


$key = "MySecretKey";  


$encryptedPassword = encrypt($password, $key);




$query = "SELECT 
    au.*, 
    urm.RoleId,
    CASE 
        WHEN urm.RoleId = 2 THEN (SELECT u.Id FROM Users u WHERE u.UserId = au.Id)
        WHEN urm.RoleId = 3 THEN (SELECT c.ChefID FROM Chefs c WHERE c.UserId = au.Id)
        ELSE NULL
    END AS UserId
FROM 
    AppUsers au
INNER JOIN 
    UserRolesManagers urm ON au.Id = urm.UserId
WHERE 
    au.Email =  '$email' 
    LIMIT 1";

// Execute the query
$result = $connection->query($query);

// Check if the query was successful and if user exists
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    // Compare the encrypted password from the user with the one in the database
    if ($encryptedPassword === $row['Password']) {
        echo json_encode(array('status' => 'success', 'message' => 'Login successful', 'user_id' => $row['Id'], 'role_id' => $row['RoleId'],'userid' => $row['UserId']));
    } else {
        echo json_encode(array('status' => 'error', 'message' => 'Incorrect password.'));
    }
} else {
    echo json_encode(array('status' => 'error', 'message' => 'User not found.'));
}

// Close the MySQL connection
$connection->close();
?>
