require("dotenv").config();
const express = require("express");
const path = require("path");
const sql = require("mssql");
const cors = require("cors");
const dbConfig = require("./dbConfig");

// -------------------- Swagger Setup Start --------------------
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lions Befrienders API",
      version: "1.0.0",
      description: "API documentation for the Lions Befrienders platform",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  // Point to all controllers for auto doc generation:
  apis: [
    "./controllers/*.js",
    "./controllers/fengfan_folder/*.js",
    "./controllers/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
const swaggerUiOpts = {
  customSiteTitle: "Lions Befrienders API Docs",
};
const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOpts));
// -------------------- Swagger Setup End --------------------

// for eventbrite API (if used)
// const { syncEvents } = require('./src/eventbrite-sync');

// Import Google Cloud Translation API
const { TranslationServiceClient } = require('@google-cloud/translate').v3beta1;
const translationClient = new TranslationServiceClient();
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'global';

// Controllers and Middlewares
// Samuels Controllers
const profileController = require("./controllers/profileController");
const {validateRegisterProfile, validateUpdateProfile, validateProfileId } = require("./middlewares/profileValidation");
const userController = require("./controllers/userController");
const { verifyJWT } = require("./middlewares/authMiddleware")
//-----------------------------------------------------------------------------------------------
// Junweis Controllers
const caloriesController = require('./controllers/caloriescontroller');
const weatherController = require('./controllers/weathercontroller');
//-----------------------------------------------------------------------------------------------
// Ryans Controllers
const ptsCtrl     = require('./controllers/pointsController');
const cartCtrl    = require('./controllers/cartController');
const historyCtrl = require('./controllers/historyController');
const videoCtrl   = require('./controllers/videoTaskController');

//-----------------------------------------------------------------------------------------------
//Zq controller
const medController = require("./controllers/managemed_Controller");
const { validateMedication, validateId } = require("./middlewares/managemed_middleware");
//-----------------------------------------------------------------------------------------------
//fengfan controller

const UserProfileController = require("./controllers/fengfan_folder/user_profile_controller")
const EventController = require("./controllers/fengfan_folder/event_controller.js");
const groupController = require("./controllers/fengfan_folder/group_controller.js");
const friendController = require("./controllers/fengfan_folder/friend_controller.js");
const chatController = require("./controllers/fengfan_folder/chat_controller.js");
const groupChatController = require("./controllers/fengfan_folder/group_chat_controller.js");
const mailboxController = require('./controllers/fengfan_folder/message_controller.js'); 

//const { 
 // fetchCategories,
  //fetchAndSyncOrgEvents,
  //getEventsByCategory 
//} = require('./src/controllers/eventbriteController');

const eventbriteController = require('./controllers/fengfan_folder/eventbriteController.js');

//-----------------------------------------------------------------------------------------------

// fengfan middleware
const {
  validateSendMessage,
  validateChatHistoryParams
} = require('./middlewares/chat_middleware.js');
const validateFriend = require('./middlewares/friend_middleware.js');
const validateUpdateGroup = require('./middlewares/group_middleware.js');
//-----------------------------------------------------------------------------------------------

const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies and CORS) - Cleaned up duplicates
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors()); // Enable CORS for all routes

// Redirect root URL to signin.html FIRST, before serving static files
app.get("/", (req, res) => {
    res.redirect("/signin.html");
});

// Serve static files from the 'public' directory AFTER the root redirect
app.use(express.static(path.join(__dirname, 'public')));


// Routes
// Full Profile Management Routes -----------------------------------------------------------------------------------------------------------------------
//Samuel-----------------------------------------------------------------------------------------------------------------
// Routes for a logged-in user to manage their OWN profile
app.get("/profiles/me", verifyJWT, profileController.getOwnProfile);
app.put("/profiles/me", verifyJWT, validateUpdateProfile, profileController.updateOwnProfile);

// Public User Registration (defaults to 'member' role)
app.post("/users", validateRegisterProfile, userController.registerUser);

// User Login
app.post("/users/login", userController.loginUser);

// Admin-only route for creating users with specified roles
app.post("/users/admin-register", verifyJWT, validateRegisterProfile, userController.adminRegisterUser);

// Admin-only routes for user/profile management
app.get("/users/profiles", verifyJWT, userController.getAllProfiles);
app.delete("/users/profiles/:id", verifyJWT, validateProfileId, userController.deleteUser);

// Logout route
app.post("/users/logout", verifyJWT, userController.logoutUser);

// Translation Endpoint
app.post("/translate", verifyJWT, async (req, res) => {
    const { text, targetLanguageCode } = req.body;

    if (!text || !targetLanguageCode) {
        return res.status(400).json({ error: "Text and target language are required." });
    }

    if (!projectId) {
        console.error("GOOGLE_CLOUD_PROJECT_ID environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error: Google Cloud Project ID missing." });
    }

    try {
        const request = {
            parent: `projects/${projectId}/locations/${location}`,
            contents: [text],
            targetLanguageCode: targetLanguageCode,
        };

        const [response] = await translationClient.translateText(request);
        const translatedText = response.translations[0].translatedText;

        res.status(200).json({ translatedText });

    } catch (error) {
        console.error("Error calling Google Cloud Translation API:", error);
        res.status(500).json({ error: "Failed to translate text. Please try again later." });
    }
});
//------------------------------------------------------------------------------------------------------------------------------
//JunWei-----------------------------------------------------------------------------------------------------
// ======== NDJW: Calories Tracker APIs ========
app.get('/api/graph', caloriesController.getGraphData);
app.get('/api/history', caloriesController.getHistory);
app.get('/api/food/search', caloriesController.searchFood);
app.post('/api/food/add', caloriesController.addFoodEntry);
app.delete('/api/food/delete/:id', caloriesController.deleteFoodEntry);
app.put('/api/food/update-time/:id', caloriesController.updateMealTime);
app.get('/api/food/recommend', caloriesController.getRecommendedFoods);

// ======== NDJW: Weather Alert APIs ========
app.post('/api/alerts', weatherController.saveAlertPreference);
app.get('/api/alerts', weatherController.getUserAlerts);
app.delete('/api/alerts/:id', weatherController.deleteAlert);
app.delete('/api/alerts', weatherController.deleteAllUserAlerts);

//------------------------------------------------------------------------------------------------------------------------------
// Ryan-----------------------------------------------------------------------------------------------------
// 1) Video‑points endpoints
app.get ( '/video-tasks',          verifyJWT, videoCtrl.listTasks );
app.get ( '/video-tasks/:task_id', verifyJWT, videoCtrl.getTask );
app.post( '/video-watches',        verifyJWT, videoCtrl.completeTask );

// 2) Points endpoints
app.get ( '/points', verifyJWT, ptsCtrl.getPoints );
app.put ( '/points', verifyJWT, ptsCtrl.addPoints );

// 3) Cart & redemption
app.get    ( '/cart',          verifyJWT, cartCtrl.viewCart );
app.post   ( '/cart',          verifyJWT, cartCtrl.addToCart );
app.put    ( '/cart/:cart_id', verifyJWT, cartCtrl.editCart );
app.delete ( '/cart/:cart_id', verifyJWT, cartCtrl.removeFromCart );

// 4) Checkout
app.post('/cart/checkout', verifyJWT, cartCtrl.checkout);

// 5) History
app.get ( '/history', verifyJWT, historyCtrl.getHistory );
app.post( '/history', verifyJWT, historyCtrl.logHistory );

//------------------------------------------------------------------------------------------------------------------------------
//zq 

// history
app.get("/medications/history", medController.getMedicationHistory);
app.post("/medications/:id/taken", medController.logMedicationTaken);
app.post("/medications/:id/mark", medController.markAsTaken);

// Medication routes
app.get("/medications", medController.getAllMedications);
app.get("/medications/:id", validateId, medController.getMedicationById);
app.post("/medications", validateMedication, medController.createMedication);
app.delete("/medications/:id", medController.deleteMedicationById);
app.put("/medications/:id", medController.updateMedicationById);
//-----------------------------------------------------------------------------------------------
// fengfan route 
// user
app.get("/profiles/recommended/:user_id", UserProfileController.getRecommendedProfiles);
app.get("/profile/:user_id",UserProfileController.getInfo)
app.put("/profile/:user_id",UserProfileController.updateHobby)
// event
// event brite
app.get('/eventbrite/events', eventbriteController.fetchAndSyncOrgEvents);
app.get("/user/event/:user_id" ,EventController.getUserEvent);
app.get("/event/:event_id", EventController.getEventDetails);
app.get("/getEvent", EventController.fetchEvent);
app.post("/user_event", EventController.signUpEvent); // Endpoint to sign up for an event
app.delete("/user_event", EventController.cancelEvent);// Endpoint to cancel an event
app.get('/events/status', EventController.checkUserEventStatus); // Endpoint to check user event status
// group
app.get("/group/:user_id", groupController.getUserGroups);
app.get("/detail/group/:group_id",groupController.getgroupById)

// add group member
app.post('/group-members', groupController.addGroupMember);
app.post('/group-owner', groupController.addGroupOwner);
app.get("/member/:group_id", groupController.getGroupMember)
app.get("/member/detail/:user_id", groupController.getMemberDetail);
app.get("/group/:group_id/members/profile", groupController.getGroupMemberProfiles);
app.delete("/group/:group_id",groupController.deleteGroup)
app.put("/group/:group_id",validateUpdateGroup, groupController.updateGroup);
app.post('/create/groups', groupController.createGroup);


// friend
app.get('/friends/:user_id', friendController.getFriend);
app.delete('/friends/:user_id/:friend_id',friendController.removeFriend);
app.get('/friends/:user_id/:friend_id', friendController.getFriendInfo);
app.post('/friends/:user_id/:friend_id',friendController.addFriend);
app.put('/friends/:user_id/:friend_id', friendController.updateFriendInfo);

// chat
app.get('/private-chat/:senderId/:receiverId',validateChatHistoryParams, chatController.getChatHistory);
app.post('/private-chat',validateSendMessage, chatController.sendMessage);


// group chat
app.get('/group-chat/:groupId', groupChatController.getGroupChatHistory);
app.post('/group-chat/send',groupChatController.sendGroupMessage);
app.get('/group-info/:groupId', groupChatController.getGroupInfo);
app.get('/group-members/:groupId', groupChatController.getGroupMembers);
// message
app.get('/mailbox/:user_id', mailboxController.getMailboxMessages);

//-----------------------------------------------------------------------------------------------

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  try {
    await sql.close();
    console.log("Database connections closed");
  } catch (err) {
    console.error("Error closing database connections:", err);
  }
  process.exit(0);
});

// Start server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  // Database Connection Test
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Database connected successfully!");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
});
