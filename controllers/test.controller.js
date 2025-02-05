const db = require("../config/db");
const bcrypt = require("bcrypt");
const redisClient = require('../config/redisConfig');
const generateToken = require("../utils/jwtTokenHandler");
const { sendOTPByEmail } = require("../helper/email");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

const setRedisKeyWithExpiry = async (key, value, expiryTime) => {
    console.log("key, value, expiryTime", key, value, expiryTime);
    await redisClient.del(key);
    await redisClient.set(key, value, 'EX', expiryTime);
};

const signUp = async (req, res) => {
    try {
        const { email, password, } = req.body;

        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) return res.status(409).json({ status: 0, message: "User already exists" });

        const otp = Math.floor(1000 + Math.random() * 9000);

        const signUpEmailKey = `signUp:${email}`;
        await setRedisKeyWithExpiry(signUpEmailKey, email, 300);

        const otpKey = `signUpOTP:${email}`;
        await setRedisKeyWithExpiry(otpKey, otp, 60);

        // await sendOTPByEmail(email, otp);

        const user = await db.User.create({ email, password});
        res.status(201).json({ status: 1, message: "User created successfully, OTP sent to your registered email", otp, user });
    } catch (error) {
        console.error("Error signing up user:", error);
        res.status(500).json({ status: 0, message: "Internal Server Error" });
    }
};
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await db.User.findOne({ where: { email } });
        if (!existingUser) return res.status(404).json({ status: 0, message: "User not found" });

        const signUpEmailKey = `signUp:${email}`;
        const keyExists = await redisClient.exists(signUpEmailKey);
        if (!keyExists) return res.status(401).json({ status: 0, message: "Unauthorize" });

        const otp = Math.floor(1000 + Math.random() * 9000);

        const otpKey = `signUpOTP:${email}`;
        await setRedisKeyWithExpiry(otpKey, otp, 60);
        // await common_fun.sendOTPByEmail(email, otp);

        res.status(200).json({ status: 1, message: "OTP resent to your registered email", otp });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ status: 0, message: "Internal Server Error" });
    }
};
const otpVerify = async (req, res) => {
    try {
        const { email, otp } = req.body;

        let user = await db.User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ status: 0, message: "User not found" });

        const signUpEmailKey = `signUp:${email}`;
        const keyExists = await redisClient.exists(signUpEmailKey);
        if (!keyExists) return res.status(401).json({ status: 0, message: "unauthorize" });

        const otpKey = `signUpOTP:${email}`;
        const storedOtp = await redisClient.get(otpKey);
        if (!storedOtp) return res.status(400).json({ status: 0, message: "OTP has expired" });
        if (storedOtp != otp) return res.status(400).json({ status: 0, message: "Invalid OTP" });

        await redisClient.del(otpKey, signUpEmailKey);


        const passwordKey = `password:${email}`;
        await setRedisKeyWithExpiry(passwordKey, email, 180);

        await user.update({ is_verified: true })
        res.status(200).json({ status: 1, message: "User verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ status: 0, message: "Internal Server Error" });
    }
};

const forgetPassword = async (req, res) => {
    try {
      const db = req.dbInstance
      const { email } = req.body; // Use emailId from the request body
      // const email = emailId; // Assign emailId to email variable for clarity
  
      let user = await db.User.findOne({ where: { email, signup_by: "normal" } });
      if (!user) return res.status(404).json({ status: 0, message: "User with the provided email not found" });
  
      const otp = Math.floor(1000 + Math.random() * 9000);
  
      const otpKey = `forgetPassOTP:${email}`;
      await setRedisKeyWithExpiry(otpKey, otp, 60);
  
      const emailKey = `forgetpass:${email}`;
      await setRedisKeyWithExpiry(emailKey, email, 180);
  
    //   await sendOTPByEmail(email, otp);
      res.status(200).json({ status: 1, message: "OTP sent to your registered email for password reset", otp, });
    } catch (error) {
      console.error("Error sending temporary password:", error);
      res.status(500).json({ status: 0, message: "Internal Server Error" });
    }
  };
  const forgetPasswordResendOTP = async (req, res) => {
    try {
      const { email } = req.body;
  
      const emailKey = `forgetpass:${email}`;
      const emailExists = await redisClient.exists(emailKey);
      if (!emailExists) return res.status(401).json({ status: 0, message: "Unauthorize" });
  
      const otp = Math.floor(1000 + Math.random() * 9000);
  
      const otpKey = `forgetPassOTP:${email}`;
      await setRedisKeyWithExpiry(otpKey, otp, 60);
  
    //   await sendOTPByEmail(email, otp);
  
      res.status(200).json({ status: 1, message: "OTP resent to your registered email for password reset", otp });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ status: 0, message: "Internal Server Error" });
    }
  };
  const forgetPasswordVerification = async (req, res) => {
    try {
      const { email, otp } = req.body;
      const emailKey = `forgetpass:${email}`;
      const emailExists = await redisClient.exists(emailKey);
      if (!emailExists) return res.status(401).json({ status: 0, message: "Unauthorize" });
  
      const otpKey = `forgetPassOTP:${email}`;
      const storedOtp = await redisClient.get(otpKey);
      if (!storedOtp) return res.status(400).json({ status: 0, message: "OTP has expired" });
      if (storedOtp != otp) return res.status(400).json({ status: 0, message: "Invalid OTP" });
  
      await redisClient.del(otpKey, emailKey);
  
      const resetPassKey = `resetPass:${email}`;
      await setRedisKeyWithExpiry(resetPassKey, email, 90);
  
      res.status(200).json({ status: 1, message: "Email verified successfully, proceed with password reset" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ status: 0, message: "Internal Server Error" });
    }
  };
  const resetPassword = async (req, res) => {
    try {
      const db = req.dbInstance
  
      const { email, newPassword } = req.body;
  
      const resetPassKey = `resetPass:${email}`;
      const resetPassKeyy = await redisClient.exists(resetPassKey);
      if (!resetPassKeyy) return res.status(401).json({ status: 0, message: "Unauthorize" });
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      const user = await db.User.findOne({ where: { email, signup_by: "normal" } });
      await user.update({ password: hashedPassword });
  
      redisClient.del(resetPassKey);
      const tokens = await db.Token.findAll({ where: { user_id: user.user_id } });
  
      const randomNumber = Math.floor(1 + Math.random() * 9);
      for (let token of tokens) {
        token.tokenVersion += randomNumber;
        await token.save();
      }
      res.status(200).json({ status: 1, message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ status: 0, message: "Internal Server Error" });
    }
  };

module.exports = {
    signUp,
    otpVerify,
    resendOTP
}