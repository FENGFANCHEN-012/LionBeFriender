// controllers/historyController.js
const History = require('../models/history_model');

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get redemption history for the current user
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's voucher redemption history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
exports.getHistory = async (req, res, next) => {
  try {
    const hist = await History.getHistory(req.user.user_id);
    res.json({ history: hist });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /history:
 *   post:
 *     summary: Log history entries for the current user
 *     description: Log an array of redeemed vouchers to the user's history. Typically used internally after redemption.
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 description: Array of voucher objects
 *                 items:
 *                   type: object
 *                   properties:
 *                     voucher_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: History recorded
 *       401:
 *         description: Unauthorized
 */
exports.logHistory = async (req, res, next) => {
  try {
    const items = req.body.items; // array of { voucher_id, title, quantity }
    await require('../models/history_model')
            .logEntries(req.user.user_id, items);
    res.json({ msg: 'History recorded' });
  } catch(err) {
    next(err);
  }
};
