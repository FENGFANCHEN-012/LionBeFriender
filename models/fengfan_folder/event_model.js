
const sql = require("mssql");
const dbConfig = require("../../dbConfig.js");

// Get events for a user
async function getUserEvent(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT e.*
      FROM event_signup es
      JOIN Event e ON es.event_id = e.event_id
      WHERE es.user_id = @userId
    `;
    const result = await connection.request()
      .input("userId", sql.Int, userId)
      .query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close().catch(err => console.error("Error closing connection:", err));
    }
  }
}

// Fetch all events
async function fetchEvents() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Event";
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close().catch(err => console.error("Error closing connection:", err));
    }
  }
}

// Get event details by ID
async function getEventDetails(eventId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Event WHERE event_id = @eventId";
    const result = await connection.request()
      .input("eventId", sql.Int, eventId)
      .query(query);
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close().catch(err => console.error("Error closing connection:", err));
    }
  }
}

// Sign up for an event

async function signUpEvent(eventId, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Validate user_id exists in Users table
    const userCheckQuery = `
      SELECT 1 FROM Users
      WHERE user_id = @userId
    `;
    const userCheckResult = await connection.request()
      .input("userId", sql.Int, userId)
      .query(userCheckQuery);

    if (userCheckResult.recordset.length === 0) {
      throw new Error("User not found");
    }

    // Validate event exists and is eligible for sign-up
    const eventCheckQuery = `
      SELECT status, [end]
      FROM Event
      WHERE event_id = @eventId
    `;
    const eventCheckResult = await connection.request()
      .input("eventId", sql.Int, eventId)
      .query(eventCheckQuery);

    if (eventCheckResult.recordset.length === 0) {
      throw new Error("Event not found");
    }

    const event = eventCheckResult.recordset[0];
    // Allow sign-up for 'live' or 'active' status
    if (!['live', 'active'].includes(event.status)) {
      throw new Error(`Cannot sign up for an event with status '${event.status}'`);
    }
    if (new Date(event.end) < new Date()) {
      throw new Error("Cannot sign up for a past event");
    }

    // Check for existing registration
    const checkQuery = `
      SELECT 1 FROM event_signup 
      WHERE event_id = @eventId AND user_id = @userId
    `;
    const checkResult = await connection.request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query(checkQuery);

    if (checkResult.recordset.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE event_signup 
        SET status = 'signed_up'
        WHERE event_id = @eventId AND user_id = @userId
      `;
      await connection.request()
        .input("eventId", sql.Int, eventId)
        .input("userId", sql.Int, userId)
        .query(updateQuery);
    } else {
      // Insert new record
      const insertQuery = `
        INSERT INTO event_signup (event_id, user_id, status)
        VALUES (@eventId, @userId, 'signed_up')
      `;
      await connection.request()
        .input("eventId", sql.Int, eventId)
        .input("userId", sql.Int, userId)
        .query(insertQuery);
    }

    return true;
  } catch (error) {
    console.error("Database error in signUpEvent:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close().catch(err => console.error("Error closing connection:", err));
    }
  }
}



// Cancel event registration
async function cancelEvent(eventId, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      DELETE FROM event_signup 
      WHERE event_id = @eventId AND user_id = @userId
    `;
    const result = await connection.request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query(query);

    return { 
      success: result.rowsAffected[0] > 0,
      message: result.rowsAffected[0] > 0 
        ? "Registration cancelled successfully" 
        : "No registration found"
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close().catch(err => console.error("Error closing connection:", err));
    }
  }
}

// Check user event registration status
async function checkUserEventStatus(userId, eventId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT status FROM event_signup 
      WHERE user_id = @userId AND event_id = @eventId
    `;
    const result = await connection.request()
      .input("userId", sql.Int, userId)
      .input("eventId", sql.Int, eventId)
      .query(query);
    
    return { 
      exists: result.recordset.length > 0,
      status: result.recordset[0]?.status || null
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close().catch(err => console.error("Error closing connection:", err));
    }
  }
}

module.exports = {
  getUserEvent,
  fetchEvents,
  getEventDetails,
  signUpEvent,
  cancelEvent,
  checkUserEventStatus
};






