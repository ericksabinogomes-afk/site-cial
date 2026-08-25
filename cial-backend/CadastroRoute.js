const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const SUPABASE_URL = 'https://gbiaozfsqmiljpdxqwlp.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

router.post('/cadastro', async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      cpf,
      telefone,
      whatsapp,
      cep,
      rua,
      bairro,
      cidade,
      estado,
      numero_endereco,
      tipo_pessoa,
      cnpj,
      razao_social,
      nome_fantasia
    } = req.body

    // 1) Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome
      }
    })

    if (authError) {
      console.error('Erro Supabase Auth:', authError)
      return res.status(400).json({ ok: false, erro: authError.message })
    }

    // 2) Inserir na tabela usuarios (SÓ colunas que existem)
    const { data: usuarios, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        nome,
        email,
        cpf,
        telefone,
        whastapp: whatsapp,   // coluna no banco é "whastapp"
        tipo: tipo_pessoa,    // "Fisica" ou "Juridica"
      })
      .select('id')

    if (usuarioError) {
      console.error('Erro ao inserir em usuarios:', usuarioError)
      return res.status(400).json({ ok: false, erro: usuarioError.message })
    }

    const usuarioId = usuarios[0].id

    // 3) Inserir endereço (tabela Enderecos)
    const { error: enderecoError } = await supabase
      .from('Enderecos')
      .insert({
        usuario_id: usuarioId,
        cep,
        rua,
        bairro,
        cidade,
        estado,
        numero_endereco
      })

    if (enderecoError) {
      console.error('Erro ao inserir em Enderecos:', enderecoError)
      // não bloqueio o cadastro, só registro o erro
    }

    // 4) Se for pessoa jurídica, inserir em dados_pj
    if (tipo_pessoa === 'pj' && cnpj) {
      const cnpjLimpo = String(cnpj).replace(/\D/g, '')

      const { error: pjError } = await supabase
        .from('dados_pj')
        .insert({
          usuario_id: usuarioId,
          cnpj: cnpjLimpo,
          razao_social,
          nome_fantasia
        })

      if (pjError) {
        console.error('Erro ao inserir em dados_pj:', pjError)
      }
    }

    return res.json({ ok: true })

  } catch (err) {
    console.error('Erro inesperado no /cadastro:', err)
    return res.status(500).json({ ok: false, erro: 'Erro interno no servidor' })
  }
})

module.exports = router;
