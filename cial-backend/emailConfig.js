
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = { transporter };

export async function testEmail() {
  try {
    await transporter.verify();
    console.log('✅ Email configurado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar email:', error.message);
    return false;
  }
}