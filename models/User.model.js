const bcrypt = require("bcrypt");

const User = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profile_image: {
        type: DataTypes.STRING,
      },
      // otp: {
      //   type: DataTypes.INTEGER,
      // },
      // otp_created_at: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      // },
      // otp_type: {
      //   type: DataTypes.STRING,
      // },
      // otp_verified: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
      is_account_setup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_verified:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    },
    {
      timestamps: true,
      tableName: "tbl_user",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const hashPassword = await bcrypt.hash(
              user.password,
              await bcrypt.genSalt(10)
            );
            user.password = hashPassword;
          }
        },
        afterCreate: (row) => {
          delete row.dataValues.password;
        },
      },
    }
  );

  return User;
};

module.exports = User;
