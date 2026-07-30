<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once "../conexao.php"; 

$nome       = $_POST['nome']       ?? '';
$tipoPerfil = $_POST['tipoPessoa'] ?? '';
$email      = $_POST['email']      ?? '';
$senha      = $_POST['senha']      ?? '';
$whatsapp   = $_POST['whatsapp']   ?? '';

$sql = "INSERT INTO usuarios (nome, tipo_perfil, email, senha, whatsapp)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $con->prepare($sql);
$stmt->bind_param("sssss", $nome, $tipoPerfil, $email, $senha, $whatsapp);

if ($stmt->execute()) {
    echo "Cadastro realizado com sucesso!";
} else {
    echo "Erro ao cadastrar: " . $stmt->error;
}
?>