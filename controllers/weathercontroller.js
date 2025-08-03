const weatherModel = require('../models/weatherModel');

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Save a weather alert preference for a user
 *     tags: [Weather]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - weather_type
 *               - alert_time
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID
 *               weather_type:
 *                 type: string
 *                 description: The weather condition (e.g., Rain, Thunderstorm)
 *               alert_time:
 *                 type: integer
 *                 description: Minutes from midnight (0-1439)
 *     responses:
 *       201:
 *         description: Alert preference saved successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
async function saveAlertPreference(req, res) {
  const { user_id, weather_type, alert_time } = req.body;

  // Basic validation
  if (!user_id || !weather_type || alert_time === undefined || alert_time === null) {
    return res.status(400).json({ error: 'Missing required fields: user_id, weather_type, and alert_time are required.' });
  }
  if (typeof user_id !== 'number' || user_id <= 0) {
    return res.status(400).json({ error: 'Invalid user_id. Must be a positive number.' });
  }
  if (typeof weather_type !== 'string' || weather_type.trim() === '') {
    return res.status(400).json({ error: 'Invalid weather_type. Must be a non-empty string.' });
  }
  if (typeof alert_time !== 'number' || alert_time < 0 || alert_time >= 1440) {
    return res.status(400).json({ error: 'Invalid alert_time. Must be a number between 0 and 1439 (minutes from midnight).' });
  }

  try {
    const success = await weatherModel.saveAlert(user_id, weather_type, alert_time);
    if (success) {
      res.status(201).json({ message: 'Alert preference saved successfully!' });
    } else {
      res.status(500).json({ error: 'Failed to save alert preference.' });
    }
  } catch (error) {
    console.error('Controller error saving alert preference:', error);
    res.status(500).json({ error: 'Internal server error saving alert preference.' });
  }
}

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all weather alert preferences for a user
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to retrieve alerts for
 *     responses:
 *       200:
 *         description: List of alerts for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid user_id in query
 *       500:
 *         description: Internal server error fetching user alerts
 */
async function getUserAlerts(req, res) {
  const userId = parseInt(req.query.user_id);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user_id in query. Must be a positive number.' });
  }

  try {
    const alerts = await weatherModel.getAlertsByUserId(userId);

    const formattedAlerts = alerts.map(alert => {
      const storedTime = new Date(alert.created_at);
      const correctedTime = new Date(storedTime.getTime() - 8 * 60 * 60 * 1000);
      const formattedTime = correctedTime.toLocaleString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return { ...alert, created_at: formattedTime };
    });

    res.status(200).json(formattedAlerts);
  } catch (error) {
    console.error('Controller error fetching user alerts:', error);
    res.status(500).json({ error: 'Internal server error fetching user alerts.' });
  }
}

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete a weather alert by its ID
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The alert ID to delete
 *     responses:
 *       200:
 *         description: Alert deleted successfully
 *       400:
 *         description: Invalid alert ID
 *       404:
 *         description: Alert not found or already deleted
 *       500:
 *         description: Internal server error deleting alert
 */
async function deleteAlert(req, res) {
  const alertId = parseInt(req.params.id);

  if (isNaN(alertId) || alertId <= 0) {
    return res.status(400).json({ error: 'Invalid alert ID. Must be a positive number.' });
  }

  try {
    const success = await weatherModel.deleteAlertById(alertId);
    if (success) {
      res.status(200).json({ message: 'Alert deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Alert not found or already deleted.' });
    }
  } catch (error) {
    console.error('Controller error deleting alert:', error);
    res.status(500).json({ error: 'Internal server error deleting alert.' });
  }
}

/**
 * @swagger
 * /api/alerts:
 *   delete:
 *     summary: Delete all weather alerts for a user
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID whose alerts are to be deleted
 *     responses:
 *       200:
 *         description: All alerts deleted successfully
 *       400:
 *         description: Invalid user_id in query
 *       404:
 *         description: No alerts found for this user to delete
 *       500:
 *         description: Internal server error deleting all alerts
 */
async function deleteAllUserAlerts(req, res) {
  const userId = parseInt(req.query.user_id);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user_id in query. Must be a positive number.' });
  }

  try {
    const success = await weatherModel.deleteAllAlertsByUserId(userId);
    if (success) {
      res.status(200).json({ message: 'All alerts deleted successfully.' });
    } else {
      res.status(404).json({ error: 'No alerts found for this user to delete.' });
    }
  } catch (error) {
    console.error('Controller error deleting all alerts:', error);
    res.status(500).json({ error: 'Internal server error deleting all alerts.' });
  }
}

module.exports = {
  saveAlertPreference,
  getUserAlerts,
  deleteAlert,
  deleteAllUserAlerts
};
