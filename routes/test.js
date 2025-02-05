const router = require("express").Router();

const user = require("../controllers/test.controller");
const validator = require("../utils/validatonHandler");
const validaton = require("../validation/validation");
const upload = require("../middleware/multer.middleware");
const uploadImage = upload.single("profile");
const verifyToken = require("../middleware/auth.middleware");


// signup user
router.post("/register",  user.signUp);
router.post("/verift_otp",  user.otpVerify);
router.post("/resendotp",  user.resendOTP);

module.exports = router;
