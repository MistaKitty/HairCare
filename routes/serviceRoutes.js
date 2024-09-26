const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

router.get("/", serviceController.getAllServices);

router.post("/", authorizeRoles("admin"), serviceController.createService);

router.put("/:id", authorizeRoles("admin"), serviceController.updateService);

router.delete("/:id", authorizeRoles("admin"), serviceController.deleteService);

module.exports = router;
