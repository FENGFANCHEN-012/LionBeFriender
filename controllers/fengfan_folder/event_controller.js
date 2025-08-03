
const eventModel = require("../../models/fengfan_folder/event_model.js");

// Get events for a user
async function getUserEvent(req, res) {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const events = await eventModel.getUserEvent(parseInt(user_id));
    res.status(200).json(events);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching user events" });
  }
}

// Get event details by ID
async function getEventDetails(req, res) {
  try {
    const { event_id } = req.params;
    if (!event_id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const event = await eventModel.getEventDetails(parseInt(event_id));
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching event details" });
  }
}

// Fetch all events
async function fetchEvent(req, res) {
  try {
    const events = await eventModel.fetchEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
}

// Check user event registration status
async function checkUserEventStatus(req, res) {
  try {
    const { event_id, user_id } = req.query;
    if (!event_id || !user_id) {
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    const result = await eventModel.checkUserEventStatus(parseInt(user_id), parseInt(event_id));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error checking event status:", error);
    res.status(500).json({ 
      exists: false,
      status: null,
      error: "Failed to check registration status"
    });
  }
}

// Sign up for an event
async function signUpEvent(req, res) {
  try {
    const { event_id, user_id } = req.body;
    if (!event_id || !user_id) {
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    await eventModel.signUpEvent(parseInt(event_id), parseInt(user_id));
    res.status(200).json({ 
      success: true,
      message: "Sign-up successful"
    });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(400).json({ 
      success: false,
      error: error.message || "Sign-up failed"
    });
  }
}

// Cancel event registration
async function cancelEvent(req, res) {
  try {
    const { event_id, user_id } = req.body;
    if (!event_id || !user_id) {
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    const result = await eventModel.cancelEvent(parseInt(event_id), parseInt(user_id));
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(404).json({ error: result.message });
    }
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error cancelling registration" });
  }
}

module.exports = {
  getUserEvent,
  getEventDetails,
  fetchEvent,
  checkUserEventStatus,
  signUpEvent,
  cancelEvent
};
