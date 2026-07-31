<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host    = "localhost";
$usuario = "root";
$senha   = "";         
$banco   = "cial_site"; 

$con = new mysqli($host, $usuario, $senha, $banco);

if ($con->connect_error) {
    die("Erro na conexão com o banco: " . $con->connect_error);
}
?>