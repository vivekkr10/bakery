const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/auth/register", authController.register);
router.post("/auth/send-otp", authController.sendOtp);
router.post("/auth/verify-otp", authController.verifyOtp);
router.post("/auth/set-username", authController.setUsername);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.post("/auth/forgot-password", authController.forgotPassword);
router.put("/auth/reset-password", authController.resetPassword);
router.get("/auth/me", authMiddleware, (req, res) =>
  res.json({ success: true, user: req.user })
);

module.exports = router;
