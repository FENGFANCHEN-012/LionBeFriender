const mailboxModel = require('../../models/fengfan_folder/message_model.js'); // Adjusted path to match your example

/**
 * @swagger
 * /mailbox/{user_id}:
 *   get:
 *     summary: Get all mailbox messages for a user
 *     tags: [Mailbox]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of mailbox messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Failed to get mailbox messages
 */
async function getMailboxMessages(req, res) {
    try {
        const userId = parseInt(req.params.user_id); // Match naming convention
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const messages = await mailboxModel.getMessagesByUserId(userId);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get mailbox messages' });
    }
}

module.exports = { getMailboxMessages };
