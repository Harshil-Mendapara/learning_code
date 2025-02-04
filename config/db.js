const Sequelize = require("sequelize");
const DB = require("./db.connect");

const sequelize = new Sequelize(DB.DBName, DB.DBUsername, DB.DBPassword, {
  host: DB.DBhost,
  dialect: "mysql",
});


const db = {};

const User = require("../models/User.model");
const Token = require("../models/Token.model");

db.User = User(sequelize, Sequelize);
db.Token = Token(sequelize, Sequelize);

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User.hasMany(db.Token, {
  foreignKey: "user_id",
  as: "tokens",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

db.Token.belongsTo(db.User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = db;
