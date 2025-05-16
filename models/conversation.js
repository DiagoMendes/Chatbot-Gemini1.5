// ── 1) Imports ─────────────────────────────────────────────
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// ── 2) Definição do Modelo ───────────────────────────────
const Conversation = sequelize.define(
  'Conversation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    messages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'conversations',
    timestamps: true,
  }
);

// ── 3) Exportação ──────────────────────────────────────────
module.exports = Conversation;
