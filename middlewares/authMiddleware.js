const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

function verifyJWT(req, res, next){
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
        if(err){
            return res.status(403).json({message: "Forbidden"});
        }

        // Check if the token is blacklisted
        try {
            const revoked = await userModel.isTokenRevoked(token);
            if (revoked) {
                return res.status(401).json({ message: "Token has been revoked." });
            }
        } catch (dbError) {
            console.error("Error checking revoked token:", dbError);
            return res.status(500).json({ message: "Internal server error during token validation." });
        }

        // Check user role for authorization
        const authorizedRoles = {
            // Video task endpoints
            "GET /video-tasks": ["member", "admin"],
            "GET /video-tasks/[0-9]+": ["member", "admin"],     // :task_id as regex
            "POST /video-watches": ["admin"],

            // Points endpoints
            "GET /points": ["member", "admin"],
            "PUT /points": ["member", "admin"],

            // Cart & redemption
            "GET /cart": ["member"],
            "POST /cart": ["member"],
            "PUT /cart/[0-9]+": ["member"],           // :cart_id as regex
            "DELETE /cart/[0-9]+": ["member"],        // :cart_id as regex

            // Checkout
            "POST /cart/checkout": ["member"],

            // History
            "GET /history": ["member", "admin"],
            "POST /history": ["member"],

            // (existing admin/member routes)
            "POST /users/admin-register": ["admin"], // Only admins can create users with specified roles
            "GET /users/profiles": ["admin"], // Only admin can view all user profiles
            "DELETE /users/profiles/[0-9]+": ["admin"], // Only admin can delete user profiles
            "GET /profiles/me": ["member", "admin"],
            "PUT /profiles/me": ["member", "admin"],
            "POST /users/logout": ["member", "admin"],
            "POST /translate": ["member", "admin"],
             //
              
            
        };

        const requestedEndpoint = `${req.method} ${req.path}`;
        const userRole = decoded.role;
        console.log(`Requested Endpoint: ${requestedEndpoint}`);
        console.log(`User Role: ${userRole}`);

        const authorizedRole = Object.entries(authorizedRoles).find(
        ([endpoint, roles]) => {
            const regex = new RegExp(`^${endpoint}$`);
            return regex.test(requestedEndpoint) && roles.includes(userRole);
        }
        );

        if(!authorizedRole){
            return res.status(403).json({message: "Forbidden"});
        }

        // Attach decoded user information to the request object.
        // The JWT payload now contains 'user_id' directly.
        req.user = decoded;
        next();
    })
}

module.exports = {
    verifyJWT,
}
