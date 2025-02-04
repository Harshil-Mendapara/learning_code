const Token = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    "Token",
    {
      token_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_user',
          key: 'user_id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      device_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      device_type: {
        type: DataTypes.ENUM("Android", "ios", "Web"),
        allowNull: false,
        validate: { isIn: [["Android", "ios", "Web"]] },
      },
      device_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tokenVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      tableName: "tbl_token",
    }
  );
  return Token
};

module.exports = Token;
