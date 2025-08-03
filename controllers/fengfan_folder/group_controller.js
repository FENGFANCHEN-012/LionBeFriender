const groupModel = require("../../models/fengfan_folder/group_model");
const mailboxModel = require("../../models/fengfan_folder/message_model");

/**
 * @swagger
 * /group/{user_id}:
 *   get:
 *     summary: Get all groups for a user
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of groups
 *       400:
 *         description: Valid user ID is required
 *       500:
 *         description: Error fetching user groups
 */
async function getUserGroups(req, res) {
    try {
        const { user_id } = req.params;
        
        if (!user_id || isNaN(user_id)) {
            return res.status(400).json({
                success: false,
                message: "Valid user ID is required"
            });
        }

        const groups = await groupModel.getUserGroups(user_id);
        
        res.status(200).json({
            success: true,
            data: groups
        });
        
    } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user groups",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

/**
 * @swagger
 * /create/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               owner_id:
 *                 type: integer
 *               photo_url:
 *                 type: string
 *               is_public:
 *                 type: boolean
 *               member_count:
 *                 type: integer
 *             required:
 *               - name
 *               - owner_id
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Group name and owner ID are required
 *       500:
 *         description: Failed to create group
 */
async function createGroup(req, res) {
  try {
    const { name, description, owner_id, photo_url, is_public, member_count } = req.body;
    
    if (!name || !owner_id) {
      return res.status(400).json({ 
        error: 'Group name and owner ID are required' 
      });
    }

    const groupId = await groupModel.createGroup({
      name,
      description,
      owner_id,
      photo_url,
      is_public,
      member_count: member_count || 1
    });

    res.status(201).json({ 
      success: true,
      group_id: groupId,
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create group' 
    });
  }
}

/**
 * @swagger
 * /group/{group_id}:
 *   get:
 *     summary: Get group details by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *       404:
 *         description: Group not found
 *       500:
 *         description: Error fetching group details
 */
async function getGroupDetails(req, res) {
    try {
        const { group_id } = req.params;
        const group = await groupModel.getGroupDetails(group_id);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching group details",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

/**
 * @swagger
 * /member/{group_id}:
 *   get:
 *     summary: Get all members in a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Member list
 *       404:
 *         description: Member not found
 */
async function getGroupMember(req,res)
{
try{
    const {group_id} = req.params;
    const member = await groupModel.getGroupMember(group_id);
    if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: member
        });
}
catch(error){
    console.error
}
}

/**
 * @swagger
 * /member/detail/{user_id}:
 *   get:
 *     summary: Get detailed member info
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Member detail
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching user details
 */
async function getMemberDetail(req, res) {
    try {
        const { user_id,group_id } = req.params;
        const member = await groupModel.getMemberDetail(user_id,group_id);
        
        if (!member || member.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
      
        res.status(200).json({
            success: true,
            data: member
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching user details"
        });
    }
}

/**
 * @swagger
 * /group/{group_id}:
 *   put:
 *     summary: Update a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               photo_url:
 *                 type: string
 *             required:
 *               - name
 *               - description
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         description: Invalid groupId or missing fields
 *       500:
 *         description: Update failed
 */
async function updateGroup(req, res) {
  const groupId = parseInt(req.params.group_id);
  const { name, description, photo_url } = req.body;

  if (!groupId || isNaN(groupId)) {
    return res.status(400).json({ error: "Invalid groupId" });
  }

  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  try {
    const updated = await groupModel.updateGroup(groupId, name, description, photo_url);
    if (!updated) return res.status(500).json({ error: "Update failed" });

    res.json({ success: true, message: "Group updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * @swagger
 * /group/{group_id}/members/profile:
 *   get:
 *     summary: Get all member profiles in a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: List of member profiles
 *       500:
 *         description: Error fetching member profiles
 */
async function getGroupMemberProfiles(req, res) {
    const { group_id } = req.params;
    try {
        const members = await groupModel.getGroupMemberProfiles(group_id);
        res.json({ success: true, data: members });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

/**
 * @swagger
 * /group/{group_id}:
 *   delete:
 *     summary: Delete a group and notify members
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *             required:
 *               - reason
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       400:
 *         description: Invalid group ID or reason missing
 *       404:
 *         description: Group not found
 *       500:
 *         description: Failed to delete group
 */
async function deleteGroup(req, res) {
    try {
        const groupId = parseInt(req.params.group_id);
        const { reason } = req.body;

        if (isNaN(groupId)) {
            return res.status(400).json({ success: false, error: "Invalid group ID" });
        }
        if (!reason || typeof reason !== 'string' || reason.trim() === '') {
            return res.status(400).json({ success: false, error: "Reason is required" });
        }

        // Fetch group details to get the group name
        const groupDetails = await groupModel.getGroupDetails(groupId);
        if (!groupDetails) {
            return res.status(404).json({ success: false, error: "Group not found" });
        }

        // Fetch group members
        const members = await groupModel.getGroupMember(groupId);
        if (!members || members.length === 0) {
            // Proceed with deletion even if no members are found
            console.warn(`No members found for group ID ${groupId}`);
        } else {
            // Send mailbox notifications
            const memberIds = members.map(member => member.user_id);
            const message = `Group "${groupDetails.name}" (ID: ${groupId}) was deleted. Reason: ${reason}`;
            await mailboxModel.sendMessagesToUsers(memberIds, message);
        }

        // Delete the group
        const result = await groupModel.deleteGroup(groupId);
        if (!result.success) {
            return res.status(500).json({ success: false, error: "Failed to delete group" });
        }

        res.status(200).json({ success: true, message: "Group deleted successfully" });
    } catch (error) {
        console.error('Error deleting group:', error);
        if (error.number === 547) {
            return res.status(400).json({
                success: false,
                error: "Cannot delete group because it still contains related data"
            });
        }
        res.status(500).json({
            success: false,
            error: error.message || "Error deleting group"
        });
    }
}

/**
 * @swagger
 * /detail/group/{group_id}:
 *   get:
 *     summary: Get group by ID (detailed)
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *       404:
 *         description: Group not found
 *       500:
 *         description: Error fetching group details
 */
async function  getgroupById(req,res){
     try {
        const { group_id } = req.params;
        const group = await groupModel.getgroupById(group_id);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching group details",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

/**
 * @swagger
 * /group-members:
 *   post:
 *     summary: Add a new group member
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               role:
 *                 type: string
 *             required:
 *               - group_id
 *               - user_id
 *     responses:
 *       201:
 *         description: Group member added
 *       500:
 *         description: Database operation failed
 */
async function addGroupMember(req, res) {
  try {
    let { group_id, user_id, role } = req.body;

    const result = await groupModel.addGroupMember(
      group_id,
      user_id,
      role 
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Full Error Context:', {
      timestamp: new Date().toISOString(),
      errorDetails: {
        message: error.message,
        stack: error.stack,
        rawError: error
      },
      requestBody: req.body
    });
    res.status(500).json({ 
      error: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
}

/**
 * @swagger
 * /group-owner:
 *   post:
 *     summary: Add a group owner
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               role:
 *                 type: string
 *             required:
 *               - group_id
 *               - user_id
 *               - role
 *     responses:
 *       201:
 *         description: Group owner added
 *       500:
 *         description: Failed to add group member
 */
async function addGroupOwner(req,res){
 try {
    const { group_id, user_id, role } = req.body;
    
 
    if (!group_id || isNaN(group_id)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await groupModel.addGroupOwner(
      group_id,
      user_id,
      role,
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in addGroupMember:', {
      params: req.body,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to add group member',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
}

module.exports = {
  getUserGroups,
  createGroup,
  getGroupDetails,
  getGroupMember,
  getMemberDetail,
  updateGroup,
  getGroupMemberProfiles,
  deleteGroup,
  getgroupById,
  createGroup,
  addGroupMember,
  addGroupOwner,
};
