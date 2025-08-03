const groupChatModel = require("../../models/fengfan_folder/group_chat_model");

/**
 * @swagger
 * /group-chat/{groupId}:
 *   get:
 *     summary: Get group chat history for a group
 *     tags: [Group Chat]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group
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
 *         description: Failed to fetch group chat history
 */
async function getGroupChatHistory(req, res) {
  const { groupId } = req.params;

  try {
    const messages = await groupChatModel.getGroupChatHistory(parseInt(groupId));
    return res.json(messages);
  } catch (error) {
    console.error('Error fetching group chat history:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch group chat history' });
  }
}

/**
 * @swagger
 * /group-chat/send:
 *   post:
 *     summary: Send a group chat message
 *     tags: [Group Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *               sender_id:
 *                 type: integer
 *               message:
 *                 type: string
 *             required:
 *               - group_id
 *               - sender_id
 *               - message
 *     responses:
 *       200:
 *         description: Group message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chat_id:
 *                   type: integer
 *       400:
 *         description: Missing or invalid required fields
 *       500:
 *         description: Failed to send group message
 */
async function sendGroupMessage(req, res) {
  const { group_id, sender_id, message } = req.body;

  if (!group_id || !sender_id || !message || message.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    const newMessage = await groupChatModel.sendGroupMessage(parseInt(group_id), parseInt(sender_id), message.trim());
    return res.status(200).json({ message: 'Group message sent successfully', chat_id: newMessage.chat_id });
  } catch (error) {
    console.error('Error sending group message:', error);
    return res.status(500).json({ error: error.message || 'Failed to send group message' });
  }
}

/**
 * @swagger
 * /group-info/{groupId}:
 *   get:
 *     summary: Get group information by groupId
 *     tags: [Group Chat]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group info returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Group not found
 */
async function getGroupInfo(req, res) {
  const { groupId } = req.params;

  try {
    const groupInfo = await groupChatModel.getGroupInfo(parseInt(groupId));
    return res.json(groupInfo);
  } catch (error) {
    console.error('Error fetching group info:', error);
    return res.status(404).json({ error: error.message || 'Failed to fetch group info' });
  }
}

/**
 * @swagger
 * /group-members/{groupId}:
 *   get:
 *     summary: Get all members in a group
 *     tags: [Group Chat]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Array of group members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Failed to fetch group members
 */
async function getGroupMembers(req, res) {
  const { groupId } = req.params;

  try {
    const members = await groupChatModel.getGroupMembers(parseInt(groupId));
    return res.json(members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch group members' });
  }
}

module.exports = {
  getGroupChatHistory,
  sendGroupMessage,
  getGroupInfo,
  getGroupMembers
};
