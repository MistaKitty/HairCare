const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get("/", serviceController.getAllServices);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  serviceController.createService
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  serviceController.updateService
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  serviceController.deleteService
);

module.exports = router;
