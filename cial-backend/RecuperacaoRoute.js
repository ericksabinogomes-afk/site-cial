const { Router } = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('./supabaseCliente');
const { transporter, testEmail } = require('./emailConfig');

const router = Router();

// Gera código de 6 dígitos
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rota 1: Solicitar recuperação (envia código por email)
router.post('/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // 1. Busca usuário pelo email
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();
    
    if (userError || !user) {
      // Não revela se email existe ou não (segurança)
      return res.status(200).json({ 
        message: 'Se o email existir, você receberá um código de recuperação' 
      });
    }
    
    // 2. Gera código de 6 dígitos
    const codigo = gerarCodigo();
    const expiresAt = new Date(Date.now() + 600000); // 10 minutos
    
    // 3. Deleta códigos antigos não usados desse usuário
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false);
    
    // 4. Salva novo código
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        email: user.email,
        code: codigo,
        expires_at: expiresAt
      });
    
    if (insertError) {
      console.error('Erro ao salvar código:', insertError);
      return res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
    
    // 5. Envia email com código
    await transporter.sendMail({
      from: `"CIAL Asa Sul" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Código de Recuperação - CIAL Asa Sul',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #552b04;">Recuperação de Senha</h2>
          <p>Olá!</p>
          <p>Você solicitou a recuperação de senha no <strong>CIAL Asa Sul</strong>.</p>
          <p>Use o código abaixo para continuar:</p>
          <div style="background-color: #f58220; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; margin: 20px 0;">
            ${codigo}
          </div>
          <p><strong>Este código expira em 10 minutos.</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Se você não solicitou esta recuperação, ignore este email.
          </p>
        </div>
      `
    });
    
    console.log(`✅ Código enviado para: ${user.email}`);
    
    res.status(200).json({ 
      message: 'Se o email existir, você receberá um código de recuperação' 
    });
    
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota 2: Validar código
router.post('/validar-codigo', async (req, res) => {
  try {
    const { email, codigo } = req.body;
    
    if (!email || !codigo) {
      return res.status(400).json({ error: 'Email e código são obrigatórios' });
    }
    
    // Busca código válido
    const { data: reset, error: resetError } = await supabase
      .from('password_resets')
      .select('user_id, email, expires_at, used')
      .eq('code', codigo)
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .single();
    
    if (resetError || !reset) {
      return res.status(400).json({ error: 'Código inválido' });
    }
    
    // Verifica se não expirou
    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Código expirado' });
    }
    
    res.status(200).json({ valid: true, user_id: reset.user_id });
    
  } catch (error) {
    console.error('Erro ao validar código:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota 3: Atualizar senha
router.post('/atualizar-senha', async (req, res) => {
  try {
    const { user_id, codigo, password } = req.body;
    
    if (!user_id || !codigo || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }
    
    // 1. Valida código
    const { data: reset, error: resetError } = await supabase
      .from('password_resets')
      .select('user_id, email, expires_at, used')
      .eq('code', codigo)
      .eq('user_id', user_id)
      .eq('used', false)
      .single();
    
    if (resetError || !reset) {
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    }
    
    // 2. Verifica se não expirou
    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Código expirado' });
    }
    
    // 3. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 4. Atualiza senha do usuário
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ password: hashedPassword })
      .eq('id', user_id);
    
    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
    
    // 5. Marca código como usado
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', reset.id);
    
    console.log(`✅ Senha atualizada para: ${reset.email}`);
    
    res.status(200).json({ message: 'Senha atualizada com sucesso' });
    
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;