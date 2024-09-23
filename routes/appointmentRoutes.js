const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles("admin", "worker"),
  appointmentController.getAllAppointments
);

router.post(
  "/",
  authorizeRoles("admin", "worker", "client"),
  appointmentController.createAppointment
);

router.put(
  "/:id",
  authorizeRoles("admin", "worker"),
  appointmentController.updateAppointment
);

router.delete(
  "/:id",
  authorizeRoles("admin", "worker"),
  appointmentController.deleteAppointment
);

module.exports = router;
