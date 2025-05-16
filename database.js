// ── 1) Imports ─────────────────────────────────────────────
const { Sequelize } = require('sequelize');
require('dotenv').config();

// ── 2) Instância do Sequelize ────────────────────────────
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

// ── 3) Função de Teste de Conexão ─────────────────────────
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão MySQL estabelecida com sucesso.');
  } catch (error) {
    console.error('❌ Falha ao conectar ao MySQL:', error.message);
    process.exit(1);
  }
}
testConnection();

// ── 4) Exportação ──────────────────────────────────────────
module.exports = sequelize;
