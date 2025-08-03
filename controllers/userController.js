const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const profileModel = require("../models/profileModel");

/**
 * @swagger
 * /users/profiles:
 *   get:
 *     summary: Get all user profiles (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
async function getAllProfiles(req, res){
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    }catch(error){
        console.error("Controller error: ", error);
        res.status(500).json({error: "Error retrieving user profiles"});
    }
}

/**
 * @swagger
 * /users/by-username:
 *   post:
 *     summary: Get user by username (internal use or special route)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Error retrieving user
 */
async function getUserByUsername(req, res){
    try{
        const username = req.body.username;
        const user = await userModel.getUserByUsername(username);
        if (!user){
            return res.status(404).json({error: "User not found"});
        }
        res.json(user);
    }catch(error){
        console.error("Controller error: ", error);
        res.status(500).json({error: "Error retrieving user"});
    }
}

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user (public, 'member' role)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - name
 *               - age
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               hobbies:
 *                 type: string
 *               age:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered and profile created successfully
 *       400:
 *         description: Validation error or username exists
 *       500:
 *         description: Server error
 */
async function registerUser(req, res){
    const {username, email, password, name, hobbies, age, description} = req.body;
    const role = "member";

    try{
        if(!username || !password || !name || !email || !age){
            return res.status(400).json({error: "Username, email, password, profile name, and age are required."});
        }
        if (password.length < 6){
            return res.status(400).json({error: "Password must be at least 6 characters"});
        }

        const existingUser = await userModel.getUserByUsername(username);
        if(existingUser){
            return res.status(400).json({message: "Username already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.createUser({
            username,
            email,
            passwordHash: hashedPassword,
            role,
        });

        const newProfile = await profileModel.createProfile(newUser.user_id, {
            name,
            hobbies,
            age,
            description,
        });

        res.status(201).json({
            message: "User registered and profile created successfully",
            user: newUser,
            profile: newProfile
        });
    }catch(error){
        console.error("Controller error during public registration: ", error);
        if (error.message && error.message.includes('duplicate key')) {
             return res.status(400).json({ error: "Username already exists." });
        }
        res.status(500).json({error: "Error creating user or profile"});
    }
}

/**
 * @swagger
 * /users/admin-register:
 *   post:
 *     summary: Admin creates user with specified role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *               - name
 *               - age
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [member, admin]
 *               name:
 *                 type: string
 *               hobbies:
 *                 type: string
 *               age:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created with specified role and profile
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Error creating user or profile by admin
 */
async function adminRegisterUser(req, res){
    const {username, email, password, role, name, hobbies, age, description} = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.createUser({
            username,
            email,
            passwordHash: hashedPassword,
            role,
        });

        const newProfile = await profileModel.createProfile(newUser.user_id, {
            name,
            hobbies,
            age,
            description,
        });

        res.status(201).json({
            message: `User '${username}' created with role '${role}' and profile successfully`,
            user: newUser,
            profile: newProfile
        });
    }catch(error){
        console.error("Controller error during admin user creation: ", error);
        if (error.message && error.message.includes('duplicate key')) {
             return res.status(400).json({ error: "Username already exists." });
        }
        res.status(500).json({error: "Error creating user or profile by admin"});
    }
}

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login as user (returns JWT)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success (JWT returned)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
async function loginUser(req, res) {
    const {username, password} = req.body;

    try{
        const user = await userModel.getUserByUsername(username);
        if(!user){
            return res.status(401).json({message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }

        const payload = {
            user_id: user.user_id,
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "3600s"});

        return res.status(200).json({token, role: user.role});
    }catch(err){
        console.error(err);
        return res.status(500).json({message: "Internal server error"});
    }
}

/**
 * @swagger
 * /users/profiles/{id}:
 *   delete:
 *     summary: Delete a user and profile (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User and profile deleted successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user and/or profile
 */
async function deleteUser(req, res) {
    try {
        const userIdToDelete = parseInt(req.params.id);
        if (isNaN(userIdToDelete)) {
            return res.status(400).json({ error: "Invalid user ID provided." });
        }

        const profileDeleted = await profileModel.deleteProfile(userIdToDelete);
        if (!profileDeleted) {
            console.warn(`No profile found for user ID ${userIdToDelete}, proceeding with user deletion.`);
        }

        const userDeleted = await userModel.deleteUserById(userIdToDelete);
        if (!userDeleted) {
            return res.status(404).json({ error: "User not found!" });
        }
        res.status(200).json({ message: `User with user_id ${userIdToDelete} and associated profile deleted successfully` });
    } catch (error) {
        console.error("Controller error: ", error);
        res.status(500).json({ error: "Error deleting user and/or profile" });
    }
}

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Log out the current user (revoke JWT)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: No token provided or invalid token format
 *       500:
 *         description: Error during logout
 */
async function logoutUser(req, res) {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(400).json({ message: "No token provided." });
        }

        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({ message: "Invalid token format or missing expiration." });
        }

        await userModel.addRevokedToken(token, decoded.exp);
        res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        console.error("Controller error during logout: ", error);
        res.status(500).json({ error: "Error during logout." });
    }
}

module.exports = {
    getAllProfiles,
    getUserByUsername,
    registerUser,
    adminRegisterUser,
    loginUser,
    deleteUser,
    logoutUser,
};
