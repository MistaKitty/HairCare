const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", serviceController.getAllServices);

router.post("/", authorizeRoles("admin"), serviceController.createService);

router.put("/:id", authorizeRoles("admin"), serviceController.updateService);

router.delete("/:id", authorizeRoles("admin"), serviceController.deleteService);

module.exports = router;
