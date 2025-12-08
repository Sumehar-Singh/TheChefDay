<?php
// Database configuration file (db_config.php)

// $host = "127.0.0.1:3307"; 
// $username = "root";
// $password = "";
// $database = "thechefsdaydb";


$host = "p3nlmysql51plsk.secureserver.net:3306"; 
$username = "thechefsday";
$password = "Internet@123#";
$database = "chefday";

// Create a connection to MySQL
$connection = new mysqli($host, $username, $password, $database);

// Check the connection
if ($connection->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $connection->connect_error]));
}
?>
