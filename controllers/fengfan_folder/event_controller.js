const eventModel = require("../../models/fengfan_folder/event_model.js");

/**
 * @swagger
 * /user/event/{user_id}:
 *   get:
 *     summary: Get all events for a user
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of events for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Error fetching user events
 */
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

/**
 * @swagger
 * /event/{event_id}:
 *   get:
 *     summary: Get event details by event ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: event_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Event ID is required
 *       404:
 *         description: Event not found
 *       500:
 *         description: Error fetching event details
 */
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

/**
 * @swagger
 * /getEvent:
 *   get:
 *     summary: Fetch all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error fetching events
 */
async function fetchEvent(req, res) {
  try {
    const events = await eventModel.fetchEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
}

/**
 * @swagger
 * /events/status:
 *   get:
 *     summary: Check if a user is registered for a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: event_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Registration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Event ID and User ID are required
 *       500:
 *         description: Failed to check registration status
 */
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

/**
 * @swagger
 * /user_event:
 *   post:
 *     summary: Sign up for an event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_id
 *               - user_id
 *             properties:
 *               event_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sign-up successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Event ID and User ID are required
 *       500:
 *         description: Sign-up failed
 */
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

/**
 * @swagger
 * /user_event:
 *   delete:
 *     summary: Cancel event registration
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_id
 *               - user_id
 *             properties:
 *               event_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Registration cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Event ID and User ID are required
 *       404:
 *         description: Not found
 *       500:
 *         description: Error cancelling registration
 */
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
