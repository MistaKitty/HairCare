const express = require("express");
const router = express.Router();
const userController = require("../controllers/UsersController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "worker"),
  userController.getAllUsers
);
router.post("/", userController.createUser);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  userController.updateUser
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  userController.deleteUser
);

module.exports = router;
