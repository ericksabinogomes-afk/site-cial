<?php
/**
 * stihl-api.php
 * Proxy para consumir a API de produtos STIHL
 * 
 * Esta API faz scraping da loja STIHL e retorna os produtos em JSON
 * Repositorio: https://github.com/Fez2205/stihl-products-api
 */

// URL da API de produtos STIHL (rodando localmente na porta 3000)
$api_url = 'http://localhost:3000/api/products';

// Configurar headers para JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Fazer requisicao para a API
$response = @file_get_contents($api_url);

if ($response === false) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao conectar com API de produtos STIHL',
        'message' => 'Verifique se a API stihl-products-api esta rodando em http://localhost:3000'
    ]);
    exit;
}

// Retornar os dados da API
$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao processar resposta da API',
        'details' => json_last_error_msg()
    ]);
    exit;
}

// Retorna os dados para o frontend
echo json_encode($data);
?>
