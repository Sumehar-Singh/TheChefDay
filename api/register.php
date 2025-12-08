<?php
header('Access-Control-Allow-Origin:*');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization');

include_once "config.php"; 

// Function to generate a unique identifier (UUID-like)
function generateUniqueId() {
    // Define the characters to choose from (numbers and letters)
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $length = 36; // Length of the ID (UUID-like format)

    // Initialize the ID variable
    $uniqueId = '';

    // Loop to generate random characters
    for ($i = 0; $i < $length; $i++) {
        // Append a random character from the character set
        $uniqueId .= $characters[rand(0, strlen($characters) - 1)];
    }

    // Format the string to resemble UUID format (8-4-4-4-12)
    // For example: 6795a97c-1a16-429e-805d-2328a5f9b094
    $formattedUniqueId = substr($uniqueId, 0, 8) . '-' . 
                         substr($uniqueId, 8, 4) . '-' . 
                         substr($uniqueId, 12, 4) . '-' . 
                         substr($uniqueId, 16, 4) . '-' . 
                         substr($uniqueId, 20, 12);

    return $formattedUniqueId;
}

// Function to encrypt password using XOR
function encrypt($password, $key){
    $encrypted = "";
    for ($i = 0; $i < strlen($password); $i++) {
        $encrypted .= chr(ord($password[$i]) ^ ord($key[$i % strlen($key)]));
    }
    return base64_encode($encrypted); // Return encrypted password in Base64 format
}

// Read raw POST data and decode JSON
$inputData = json_decode(file_get_contents('php://input'), true);

// Log the received JSON for debugging
error_log('Received JSON: ' . print_r($inputData, true));

// Check if email and password are provided
$email = isset($inputData['email']) ? $inputData['email'] : '';
$password = isset($inputData['password']) ? $inputData['password'] : '';
$roleId = isset($inputData['role_id']) ? $inputData['role_id'] : '';
$phone = isset($inputData['phone']) ? $inputData['phone'] : '';
$fname = isset($inputData['fname']) ? $inputData['fname'] : '';
$mname = isset($inputData['mname']) ? $inputData['mname'] : '';
$lname = isset($inputData['lname']) ? $inputData['lname'] : '';
$terms_accepted = isset($inputData['terms_accepted']) ? (int)$inputData['terms_accepted'] : 0;
$terms_accepted_at = isset($inputData['terms_accepted_at']) ? $inputData['terms_accepted_at'] : null;


if (empty($email) || empty($password) || empty($roleId)) {
    echo json_encode(array('status' => 'error', 'message' => 'Email, Password or RoleId is missing.'));
    exit();
}

// Check if the email already exists in the database
$emailCheckQuery = "SELECT COUNT(*) AS email_count FROM AppUsers WHERE Email = '$email'";
$emailCheckResult = $connection->query($emailCheckQuery);

if (!$emailCheckResult) {
    error_log('MySQL error: ' . $connection->error);
    echo json_encode(array('status' => 'error', 'message' => 'Database query failed.'));
    exit();
}


$emailCheckRow = $emailCheckResult->fetch_assoc();

if ($emailCheckRow['email_count'] > 0) {
    echo json_encode(array('status' => 'error', 'message' => 'Email is already registered.'));
    exit();
}

// Encryption key (same encryption key for React Native and PHP)
$key = "MySecretKey";  

// Encrypt the password
$encryptedPassword = encrypt($password, $key);

// Generate a unique ID for the user
$userId = generateUniqueId();

// Insert the encrypted password and generated ID into the database
$query = "INSERT INTO AppUsers (Id, Email, Password) VALUES ('$userId', '$email', '$encryptedPassword')";

// Log the query for debugging
error_log('Query: ' . $query);
if ($connection->query($query) === TRUE) {
    $roleQuery = "INSERT INTO UserRolesManagers (UserId, RoleId) VALUES ('$userId', '$roleId')";

    if ($connection->query($roleQuery) === TRUE) {
        // Only fire userDataQuery if roleId is 2 or 3
        if ($roleId == 2) {
            $userDataQuery = "INSERT INTO Users (FirstName,MiddleName,LastName, Email, Phone, UserId,Terms_Accepted,Terms_Accepted_At) VALUES ('$fname','$mname','$lname', '$email', '$phone', '$userId','$terms_accepted','$terms_accepted_at')";
        } elseif ($roleId == 3) {
            $userDataQuery = "INSERT INTO Chefs (FirstName,MiddleName,LastName, Phone, UserId,Terms_Accepted,Terms_Accepted_At) VALUES ('$fname','$mname','$lname', '$phone', '$userId','$terms_accepted','$terms_accepted_at')";
        }

        // Execute userDataQuery only if it is set
        if (isset($userDataQuery)) {
            if ($connection->query($userDataQuery) === TRUE) {
                echo json_encode(array('status' => 'success', 'message' => 'User registered, role assigned, and data saved.'));
                exit();
            } else {
                echo json_encode(array('status' => 'error', 'message' => 'Error saving info: ' . $connection->error));
                exit();
            }
        } else {
            // If roleId is not 2 or 3, return success without userDataQuery
            echo json_encode(array('status' => 'success', 'message' => 'User registered and role assigned successfully.'));
            exit();
        }
    } else {
        echo json_encode(array('status' => 'error', 'message' => 'Error assigning role: ' . $connection->error));
        exit();
    }
} else {
    echo json_encode(array('status' => 'error', 'message' => 'Error registering user: ' . $connection->error));
    exit();
}


// Close the MySQL connection
$connection->close();
?>
