<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include '../config.php'; // DB connection

$response = array();

// Decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['ChefID'])) {
    $chefId = $input['ChefID'];

    $query = "
        SELECT 
            cp.Name AS PropertyName,
            GROUP_CONCAT(cs.Name ORDER BY cs.Name SEPARATOR ', ') AS Specialties
        FROM ChefSpecialityAssigneds csa
        JOIN ChefSpecialities cs ON cs.Id = csa.SpecialityId
        JOIN ChefProperties cp ON cp.Id = cs.ChefPropertiesId
        WHERE csa.ChefId = ?
        GROUP BY cp.Id, cp.Name
    ";

    $stmt = $connection->prepare($query);
    $stmt->bind_param("s", $chefId);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $properties = [];

        while ($row = $result->fetch_assoc()) {
            $properties[] = $row;
        }

        $response['success'] = true;
        $response['data'] = $properties;
    } else {
        $response['success'] = false;
        $response['message'] = "Query execution failed.";
    }

    $stmt->close();
} else {
    $response['success'] = false;
    $response['message'] = "Invalid request or missing ChefID.";
}

echo json_encode($response);
$connection->close();
?>
