const Points = require('../models/points_model');

/**
 * @swagger
 * /points:
 *   get:
 *     summary: Get the user's current points
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's current points
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
exports.getPoints = async (req, res, next) => {
  try {
    const points = await Points.getPoints(req.user.user_id);
    res.json({ points });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /points:
 *   put:
 *     summary: Add or subtract points for the user
 *     description: Updates the user's points by a delta value (positive or negative).
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - delta
 *             properties:
 *               delta:
 *                 type: number
 *                 description: Amount to add (positive) or subtract (negative) from the user's points
 *     responses:
 *       200:
 *         description: Points updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       400:
 *         description: Invalid delta value
 *       401:
 *         description: Unauthorized
 */
exports.addPoints = async (req, res, next) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== 'number') {
      return res.status(400).json({ msg: 'body.delta must be a number' });
    }
    await Points.addPoints(req.user.user_id, delta);
    res.json({ msg: 'Points updated' });
  } catch (err) {
    next(err);
  }
};
