const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function testEmail() {
  try {
    await transporter.verify();
    console.log('✅ Configuração de e-mail validada.');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração de e-mail:', error);
    return false;
  }
}

module.exports = {
  transporter,
  testEmail
};