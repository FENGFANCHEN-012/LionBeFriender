// controllers/profileController.js
const profileModel = require("../models/profileModel");
const userModel = require("../models/userModel"); // Added userModel import

/**
 * @swagger
 * /profiles/check-name:
 *   post:
 *     summary: Check if a profile name is available
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The profile name to check
 *     responses:
 *       200:
 *         description: Name is available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       409:
 *         description: Name is taken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error during name check
 */
async function checkProfileName(req, res) {
  const { name } = req.body;

  try {
    const existingProfile = await profileModel.getProfileByName(name.trim());
    if (existingProfile) {
      return res.status(409).json({ available: false, message: "This profile name is already taken. Please choose another." });
    } else {
      return res.status(200).json({ available: true, message: "Profile name is available!" });
    }
  } catch (error) {
    console.error("Controller error checking profile name:", error);
    res.status(500).json({ error: "Internal server error during name check." });
  }
}

/**
 * @swagger
 * /profiles/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Profile not found for this user
 *       500:
 *         description: Internal server error retrieving profile
 */
async function getOwnProfile(req, res) {
  const user_id = req.user.user_id;

  try {
    const profile = await profileModel.getProfileByUserId(user_id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found for this user." });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Controller error retrieving own profile:", error);
    res.status(500).json({ error: "Internal server error retrieving profile." });
  }
}

/**
 * @swagger
 * /profiles/me:
 *   put:
 *     summary: Update the current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               hobbies:
 *                 type: string
 *               age:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   type: object
 *       404:
 *         description: Profile not found for this user
 *       409:
 *         description: The new profile name is already taken by another user
 *       500:
 *         description: Internal server error updating profile
 */
async function updateOwnProfile(req, res) {
  const user_id = req.user.user_id;
  const profileInfo = req.body;

  try {
    const existingProfile = await profileModel.getProfileByUserId(user_id);
    if (!existingProfile) {
      return res.status(404).json({ error: "Profile not found for this user." });
    }

    if (profileInfo.name && profileInfo.name.trim() !== existingProfile.name) {
      const nameConflict = await profileModel.getProfileByName(profileInfo.name.trim());
      if (nameConflict && nameConflict.user_id !== user_id) {
        return res.status(409).json({ error: "The new profile name is already taken by another user." });
      }
    }

    const updatedProfile = await profileModel.updateProfile(user_id, profileInfo);
    res.status(200).json({ message: "Profile updated successfully!", profile: updatedProfile });
  } catch (error) {
    console.error("Controller error updating profile:", error);
    res.status(500).json({ error: "Internal server error updating profile." });
  }
}

module.exports = {
  checkProfileName,
  getOwnProfile,
  updateOwnProfile,
};
