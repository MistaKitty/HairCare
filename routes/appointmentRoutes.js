const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "worker"),
  appointmentController.getAllAppointments
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "worker", "client"),
  appointmentController.createAppointment
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "worker"),
  appointmentController.updateAppointment
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "worker"),
  appointmentController.deleteAppointment
);

module.exports = router;
