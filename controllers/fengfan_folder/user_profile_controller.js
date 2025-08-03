const profileModel = require("../../models/fengfan_folder/profile_model");

/**
 * @swagger
 * /profile/{user_id}:
 *   get:
 *     summary: Get user profile information
 *     tags: [User Profile]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Success, user information returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error fetching user information
 */
async function getInfo(req, res) {
    const user_id = req.params.user_id;
    try {
        const information = await profileModel.getInfo(user_id);

        // Ensure that the data is returned properly in the response
        return res.json({
            success: true,
            data: information
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user information",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

/**
 * @swagger
 * /profile/{user_id}:
 *   put:
 *     summary: Update hobbies, detail, and description for a user profile
 *     tags: [User Profile]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_id:
 *                 type: integer
 *               hobbies:
 *                 type: string
 *               detail:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated profile info
 *       400:
 *         description: Missing or invalid user ID
 *       500:
 *         description: Error updating profile
 */
async function updateHobby(req,res){
try {
        const userId = req.params.user_id;
        const { profile_id ,hobbies, detail, description } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const updatedProfile = await profileModel.updateHobby(
            userId,profile_id , hobbies, detail, description 
        );

        res.status(200).json({
            success: true,
            data: updatedProfile
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

/**
 * @swagger
 * /profiles/recommended/{user_id}:
 *   get:
 *     summary: Get recommended profiles for a user
 *     tags: [User Profile]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of recommended profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Failed to fetch recommended profiles
 */
async function getRecommendedProfiles(req, res) {
    try {
        const userId = parseInt(req.params.user_id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const profiles = await profileModel.getRecommendedProfiles(userId);
        res.status(200).json(profiles);
    } catch (error) {
        console.error('Error in getRecommendedProfiles:', error);
        res.status(500).json({ error: "Failed to fetch recommended profiles" });
    }
}

module.exports = {
  updateHobby,
  getInfo,
  getRecommendedProfiles,
};
