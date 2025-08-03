const friendModel = require("../../models/fengfan_folder/friend_model");

/**
 * @swagger
 * /friends/{user_id}:
 *   get:
 *     summary: Get all friends of a user
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of friends
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Failed to get friends
 */
async function getFriend(req, res) {
  try {
    const userId = req.params.user_id;
    const friends = await friendModel.getFriend(userId);
    res.status(200).json(friends);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get friends" });
  }
}

/**
 * @swagger
 * /friends/{user_id}/{friend_id}:
 *   delete:
 *     summary: Remove a friend from a user's friend list
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: friend_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Friend ID to remove
 *     responses:
 *       200:
 *         description: Friend removed
 *       400:
 *         description: Invalid user ID or friend ID
 *       404:
 *         description: Friend not found
 *       500:
 *         description: Failed to remove friend
 */
async function removeFriend(req, res) {
  try {
    const userId = parseInt(req.params.user_id);
    const friendId = parseInt(req.params.friend_id);
    
    if (isNaN(userId) || isNaN(friendId)) {
      return res.status(400).json({ error: "Invalid user ID or friend ID" });
    }

    const success = await friendModel.removeFriend(userId, friendId);
    if (!success) return res.status(404).json({ error: "Friend not found" });
    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to remove friend" });
  }
}

/**
 * @swagger
 * /friends/{user_id}/{friend_id}:
 *   get:
 *     summary: Get detailed info about a specific friend
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: friend_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Friend ID
 *     responses:
 *       200:
 *         description: Friend info found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Friend not found
 *       500:
 *         description: Failed to get friend info
 */
async function getFriendInfo(req, res) {
  try {
    const { user_id, friend_id } = req.params;
    const friendInfo = await friendModel.getFriendInfo(user_id, friend_id);
    if (!friendInfo) {
      res.status(404).json({ error: "Friend not found" });
    } else {
      res.status(200).json(friendInfo);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get friend info" });
  }
}

/**
 * @swagger
 * /friends/{user_id}/{friend_id}:
 *   put:
 *     summary: Update friend info (nickname, description)
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: friend_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Friend ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nick_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend info updated
 *       500:
 *         description: Failed to update friend info
 */
async function updateFriendInfo(req, res) {
  try {
    const { user_id, friend_id } = req.params;
    const { nick_name, description } = req.body;

    await friendModel.updateFriendInfo(user_id, friend_id, nick_name, description);
    res.status(200).json({ message: "Friend info updated" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to update friend info" });
  }
}

/**
 * @swagger
 * /friends/{user_id}/{friend_id}:
 *   post:
 *     summary: Add a friend directly by user IDs
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: friend_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Friend ID to add
 *     responses:
 *       201:
 *         description: Friend added successfully
 *       200:
 *         description: Already friends
 *       400:
 *         description: Invalid user IDs or database parameter conflict
 *       500:
 *         description: Unexpected error
 */
async function addFriend(req,res){
  try {
        const userId = parseInt(req.params.user_id);
        const friendId = parseInt(req.params.friend_id);
        
        if (isNaN(userId) || isNaN(friendId)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid user IDs" 
            });
        }

        const result = await friendModel.addFriendDirectly(userId, friendId);
        
        if (result.alreadyFriends) {
            return res.status(200).json({
                success: true,
                message: `You are already friends (status: ${result.status})`
            });
        }
        
        res.status(201).json({ 
            success: true,
            message: "Friend added successfully" 
        });
    } catch (error) {
        console.error('Controller error:', error);
        if (error.message.includes('parameter name') && error.message.includes('already been declared')) {
            return res.status(400).json({
                success: false,
                error: "Database error: Parameter conflict. Please try again."
            });
        }
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
}

module.exports = {
  getFriend,
  removeFriend,
  updateFriendInfo,
  getFriendInfo,
  addFriend
};
