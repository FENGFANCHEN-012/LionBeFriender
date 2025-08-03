const eventbriteService = require('../../public/eventbrite');
const eventbriteModel = require('../../models/fengfan_folder/eventbriteModel');

/**
 * @swagger
 * /eventbrite/events:
 *   get:
 *     summary: Fetch and sync events from Eventbrite for a given organization
 *     tags: [Eventbrite]
 *     parameters:
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         description: Eventbrite organization ID (optional, defaults to first organization)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: live
 *         description: Event status (e.g. live, draft)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of events to fetch per page
 *     responses:
 *       200:
 *         description: Successfully synced events from Eventbrite
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No organizations found for this account
 *       500:
 *         description: Failed to sync events from Eventbrite
 */
async function fetchAndSyncOrgEvents(req, res) {
  const { orgId, status, pageSize } = req.query;

  try {
    let organizationId = orgId;
    if (!organizationId) {
      const organizations = await eventbriteService.fetchMyOrganizations();
      if (!organizations || organizations.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'No organizations found for this account'
        });
      }
      organizationId = organizations[0].id;
      console.log(`Using organization ID: ${organizationId}`);
    }

    // Step 2: Fetch events from Eventbrite
    console.log(`Fetching events for orgId: ${organizationId}, status: ${status}, pageSize: ${pageSize}`);
    const events = await eventbriteService.fetchOrganizationEvents(organizationId, {
      status: status || 'live',
      pageSize: pageSize || 50
    });

    console.log(`Fetched ${events.length} events from Eventbrite:`, events);

    if (!events || events.length === 0) {
      return res.json({ 
        success: true,
        message: 'No events found to sync',
        count: 0
      });
    }

    // Step 3: Sync events to database
    await eventbriteModel.syncEvents(events);

    return res.json({
      success: true,
      message: `Successfully synced ${events.length} events from Eventbrite`,
      count: events.length,
      events: events
    });
  } catch (error) {
    console.error('Error in fetchAndSyncOrgEvents:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to sync events from Eventbrite',
      error: error.message
    });
  }
}

/**
 * @swagger
 * /eventbrite/all:
 *   get:
 *     summary: Retrieve all synced events from the local database
 *     tags: [Eventbrite]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by event status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by event type
 *     responses:
 *       200:
 *         description: Successfully retrieved events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Failed to retrieve events
 */
async function getEvents(req, res) {
  const { status, type } = req.query;

  try {
    const events = await eventbriteModel.getAllEvents();
    
    // Apply filtering
    let filteredEvents = events;
    if (status) {
      filteredEvents = filteredEvents.filter(e => e.status === status);
    }
    if (type) {
      filteredEvents = filteredEvents.filter(e => e.type === type);
    }

    return res.json({
      success: true,
      count: filteredEvents.length,
      events: filteredEvents
    });
  } catch (error) {
    console.error('Error getting events:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve events',
      error: error.message
    });
  }
}

module.exports = {
  fetchAndSyncOrgEvents,
  getEvents
};
