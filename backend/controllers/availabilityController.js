import Availability from "../models/Availability.js";
import Doctor from "../models/Doctor.js";

// ================= CREATE AVAILABILITY =================
export const createAvailability = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { dayOfWeek, startTime, endTime, slotDuration } = req.body;

    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Day of week, start time, and end time are required",
      });
    }

    // Find doctor profile using logged-in user
    const doctor = await Doctor.findOne({ user: userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // Validate time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Check if availability already exists for this day
    const existingAvailability = await Availability.findOne({
      doctor: doctor._id,
      dayOfWeek,
    });

    if (existingAvailability) {
      return res.status(409).json({
        success: false,
        message: `Availability schedule for ${dayOfWeek} already exists. Update it instead.`,
      });
    }

    const availability = await Availability.create({
      doctor: doctor._id,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration: Number(slotDuration) || 30,
      isAvailable: true,
    });

    return res.status(201).json({
      success: true,
      message: "Availability created successfully",
      availability,
    });
  } catch (error) {
    console.error("Create availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create availability",
      error: error.message,
    });
  }
};

// ================= GET LOGGED-IN DOCTOR'S AVAILABILITY =================
export const getMyAvailability = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doctor = await Doctor.findOne({ user: userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const availability = await Availability.find({
      doctor: doctor._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: availability.length,
      availability,
    });
  } catch (error) {
    console.error("Get my availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
      error: error.message,
    });
  }
};

// ================= GET DOCTOR'S AVAILABILITY BY DOCTOR ID =================
export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const availability = await Availability.find({
      doctor: doctorId,
      isAvailable: true,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: availability.length,
      availability,
    });
  } catch (error) {
    console.error("Get doctor availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor availability",
      error: error.message,
    });
  }
};

// ================= UPDATE AVAILABILITY =================
export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, slotDuration, isAvailable } = req.body;

    const doctor = await Doctor.findOne({ user: userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const availability = await Availability.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability record not found",
      });
    }

    const checkStart = startTime || availability.startTime;
    const checkEnd = endTime || availability.endTime;

    if (checkStart >= checkEnd) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    if (dayOfWeek) availability.dayOfWeek = dayOfWeek;
    if (startTime) availability.startTime = startTime;
    if (endTime) availability.endTime = endTime;
    if (slotDuration) availability.slotDuration = Number(slotDuration);
    if (typeof isAvailable === "boolean") availability.isAvailable = isAvailable;

    await availability.save();

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability,
    });
  } catch (error) {
    console.error("Update availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message,
    });
  }
};

// ================= BULK SET AVAILABILITY =================
export const bulkSetAvailability = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { schedules } = req.body; // Array of { dayOfWeek, startTime, endTime, slotDuration, isAvailable }

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "schedules array is required",
      });
    }

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const updated = [];
    for (const item of schedules) {
      if (!item.dayOfWeek || !item.startTime || !item.endTime) continue;

      let record = await Availability.findOne({
        doctor: doctor._id,
        dayOfWeek: item.dayOfWeek,
      });

      if (record) {
        record.startTime = item.startTime;
        record.endTime = item.endTime;
        if (item.slotDuration) record.slotDuration = Number(item.slotDuration);
        if (typeof item.isAvailable === "boolean") record.isAvailable = item.isAvailable;
        await record.save();
        updated.push(record);
      } else {
        const newRecord = await Availability.create({
          doctor: doctor._id,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          slotDuration: Number(item.slotDuration) || 30,
          isAvailable: item.isAvailable !== false,
        });
        updated.push(newRecord);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Availability schedules updated successfully",
      count: updated.length,
      availability: updated,
    });
  } catch (error) {
    console.error("Bulk availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set bulk availability",
      error: error.message,
    });
  }
};

// ================= DELETE AVAILABILITY =================
export const deleteAvailability = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doctor = await Doctor.findOne({ user: userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const availability = await Availability.findOneAndDelete({
      _id: req.params.id,
      doctor: doctor._id,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error("Delete availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete availability",
      error: error.message,
    });
  }
};

export default {
  createAvailability,
  getMyAvailability,
  getDoctorAvailability,
  updateAvailability,
  bulkSetAvailability,
  deleteAvailability,
};