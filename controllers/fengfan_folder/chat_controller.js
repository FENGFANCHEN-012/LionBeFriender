const chatModel = require('../../models/fengfan_folder/chat_model'); 

/**
 * @swagger
 * /private-chat/{senderId}/{receiverId}:
 *   get:
 *     summary: Get chat history between two users
 *     tags: [Private Chat]
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sender's user ID
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Receiver's user ID
 *     responses:
 *       200:
 *         description: Array of chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Failed to fetch chat history
 */
async function getChatHistory(req, res) {
  const { senderId, receiverId } = req.params;
  
  try {
    const messages = await chatModel.getChatHistory(senderId, receiverId);
    return res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}

/**
 * @swagger
 * /private-chat:
 *   post:
 *     summary: Send a message to another user
 *     tags: [Private Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender_id
 *               - receiver_id
 *               - message
 *             properties:
 *               sender_id:
 *                 type: integer
 *               receiver_id:
 *                 type: integer
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to send message
 */
async function sendMessage(req, res) {
  const { sender_id, receiver_id, message } = req.body;
  
  try {
    await chatModel.sendMessage(sender_id, receiver_id, message);
    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

module.exports = {
  getChatHistory,
  sendMessage
};
