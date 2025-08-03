const caloriesModel = require('../models/caloriesmodel.js');

/**
 * @swagger
 * /api/graph:
 *   get:
 *     summary: Get total calories for graph (with recommended calories)
 *     description: Returns today's total calories and recommended calories for a user.
 *     tags: [Calories]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: Success. Returns total and recommended calories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCalories:
 *                   type: integer
 *                 recommended:
 *                   type: integer
 *       400:
 *         description: Missing or invalid user_id.
 *       500:
 *         description: Internal server error fetching graph data.
 */
async function getGraphData(req, res) {
  // ...function body unchanged
  const userId = parseInt(req.query.user_id);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Missing or invalid user_id.' });
  }

  try {
    const todayCaloriesResult = await caloriesModel.getTodayCalories(userId);
    const totalCalories = todayCaloriesResult?.total_calories || 0;

    const age = await caloriesModel.getUserAge(userId);
    if (!age) {
      return res.status(404).json({ error: 'User profile not found, cannot determine recommended calories.' });
    }

    const recommended = await caloriesModel.getRecommendedCaloriesByAge(age);

    res.status(200).json({ totalCalories, recommended });
  } catch (error) {
    console.error('Controller error fetching graph data:', error);
    res.status(500).json({ error: 'Internal server error fetching graph data.' });
  }
}

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Get today's calorie intake history
 *     description: Returns all food entries for today for a user.
 *     tags: [Calories]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: Success. Returns a list of food entries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Missing or invalid user_id.
 *       500:
 *         description: Internal server error fetching history.
 */
async function getHistory(req, res) {
  // ...function body unchanged
  const userId = parseInt(req.query.user_id);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Missing or invalid user_id.' });
  }

  try {
    const result = await caloriesModel.getDailyHistory(userId);

    const formattedResult = result.map(item => {
      let formattedTime = '00:00';
      if (item.time instanceof Date) {
        formattedTime = item.time.toISOString().substring(11, 16);
      } else if (typeof item.time === 'string' && item.time.length >= 5) {
        formattedTime = item.time.substring(0, 5);
      }
      return { ...item, time: formattedTime };
    });

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('Controller error fetching history:', error);
    res.status(500).json({ error: 'Internal server error fetching history.' });
  }
}

/**
 * @swagger
 * /api/food/search:
 *   get:
 *     summary: Search food items
 *     description: Search food items by name.
 *     tags: [Calories]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: The food name to search for
 *     responses:
 *       200:
 *         description: Success. Returns an array of food items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error searching food.
 */
async function searchFood(req, res) {
  // ...function body unchanged
  const q = req.query.q;

  if (!q || q.trim() === '') {
    return res.status(200).json([]);
  }

  try {
    const foodItems = await caloriesModel.searchFoodItems(q.trim());
    res.status(200).json(foodItems);
  } catch (error) {
    console.error('Controller error searching food:', error);
    res.status(500).json({ error: 'Internal server error searching food.' });
  }
}

/**
 * @swagger
 * /api/food/add:
 *   post:
 *     summary: Add food entry
 *     description: Add a food entry for a user.
 *     tags: [Calories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - meal_type
 *               - food_id
 *               - quantity
 *               - time
 *             properties:
 *               user_id:
 *                 type: integer
 *               meal_type:
 *                 type: string
 *               food_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               time:
 *                 type: string
 *                 description: "HH:mm or HH:mm:ss"
 *     responses:
 *       201:
 *         description: Food entry added successfully!
 *       400:
 *         description: Missing or invalid fields.
 *       404:
 *         description: Food item not found.
 *       500:
 *         description: Internal server error adding food entry.
 */
async function addFoodEntry(req, res) {
  // ...function body unchanged
  const { user_id, meal_type, food_id, quantity, time } = req.body;

  if (!user_id || !meal_type || !food_id || quantity === undefined || time === undefined) {
    return res.status(400).json({ error: 'Missing required fields: user_id, meal_type, food_id, quantity, time.' });
  }

  if (typeof user_id !== 'number' || user_id <= 0) {
    return res.status(400).json({ error: 'Invalid user_id. Must be a positive number.' });
  }
  if (typeof meal_type !== 'string' || meal_type.trim() === '') {
    return res.status(400).json({ error: 'Invalid meal_type. Must be a non-empty string.' });
  }
  if (typeof food_id !== 'number' || food_id <= 0) {
    return res.status(400).json({ error: 'Invalid food_id. Must be a positive number.' });
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity. Must be a positive number.' });
  }
  if (typeof time !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return res.status(400).json({ error: 'Invalid time format. Must be HH:mm or HH:mm:ss.' });
  }

  try {
    const caloriesPerUnit = await caloriesModel.getCaloriesPerUnit(food_id);
    if (caloriesPerUnit === null) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    const total_calories = caloriesPerUnit * quantity;
    const formattedTime = time.length === 5 ? `${time}:00` : time;

    const entryData = { user_id, meal_type, food_id, quantity, total_calories, time: formattedTime };
    const success = await caloriesModel.addFoodEntry(entryData);

    if (success) {
      res.status(201).json({ message: 'Food entry added successfully!' });
    } else {
      res.status(500).json({ error: 'Failed to add food entry.' });
    }
  } catch (error) {
    console.error('Controller error adding food entry:', error);
    res.status(500).json({ error: 'Internal server error adding food entry.' });
  }
}

/**
 * @swagger
 * /api/food/delete/{id}:
 *   delete:
 *     summary: Delete food entry by ID
 *     description: Delete a specific food entry for a user.
 *     tags: [Calories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The food entry ID
 *     responses:
 *       200:
 *         description: Food entry deleted successfully!
 *       400:
 *         description: Missing or invalid entry ID.
 *       404:
 *         description: Food entry not found or already deleted.
 *       500:
 *         description: Internal server error deleting food entry.
 */
async function deleteFoodEntry(req, res) {
  // ...function body unchanged
  const entryId = parseInt(req.params.id);

  if (isNaN(entryId) || entryId <= 0) {
    return res.status(400).json({ error: 'Missing or invalid entry ID.' });
  }

  try {
    const success = await caloriesModel.deleteEntry(entryId);
    if (success) {
      res.status(200).json({ message: 'Food entry deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Food entry not found or already deleted.' });
    }
  } catch (error) {
    console.error('Controller error deleting food entry:', error);
    res.status(500).json({ error: 'Internal server error deleting food entry.' });
  }
}

/**
 * @swagger
 * /api/food/update-time/{id}:
 *   put:
 *     summary: Update meal time
 *     description: Update the time for a specific food entry.
 *     tags: [Calories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The food entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - time
 *             properties:
 *               time:
 *                 type: string
 *                 description: "HH:mm or HH:mm:ss"
 *     responses:
 *       200:
 *         description: Meal time updated successfully!
 *       400:
 *         description: Missing or invalid entry ID or time.
 *       404:
 *         description: Food entry not found or time not updated.
 *       500:
 *         description: Internal server error updating meal time.
 */
async function updateMealTime(req, res) {
  // ...function body unchanged
  const entryId = parseInt(req.params.id);
  const { time } = req.body;

  if (isNaN(entryId) || entryId <= 0) {
    return res.status(400).json({ error: 'Missing or invalid entry ID.' });
  }
  if (typeof time !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return res.status(400).json({ error: 'Invalid time format. Must be HH:mm or HH:mm:ss.' });
  }

  try {
    const formattedTime = time.length === 5 ? `${time}:00` : time;
    const success = await caloriesModel.updateEntryTime(entryId, formattedTime);

    if (success) {
      res.status(200).json({ message: 'Meal time updated successfully!' });
    } else {
      res.status(404).json({ error: 'Food entry not found or time not updated.' });
    }
  } catch (error) {
    console.error('Controller error updating meal time:', error);
    res.status(500).json({ error: 'Internal server error updating meal time.' });
  }
}

/**
 * @swagger
 * /api/food/recommend:
 *   get:
 *     summary: Get food recommendations
 *     description: Returns a list of recommended food items under a certain calories limit.
 *     tags: [Calories]
 *     parameters:
 *       - in: query
 *         name: max
 *         schema:
 *           type: integer
 *         required: true
 *         description: Maximum calories allowed per food item
 *     responses:
 *       200:
 *         description: Success. Returns an array of recommended food items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid max calories. Must be a positive number.
 *       500:
 *         description: Internal server error fetching food recommendations.
 */
async function getRecommendedFoods(req, res) {
  // ...function body unchanged
  const maxCalories = parseInt(req.query.max);

  if (isNaN(maxCalories) || maxCalories <= 0) {
    return res.status(400).json({ error: 'Invalid max calories. Must be a positive number.' });
  }

  try {
    const recommendedFoods = await caloriesModel.getRecommendedFood(maxCalories);
    res.status(200).json(recommendedFoods);
  } catch (error) {
    console.error('Controller error fetching food recommendations:', error);
    res.status(500).json({ error: 'Internal server error fetching food recommendations.' });
  }
}

module.exports = {
  getGraphData,
  getHistory,
  searchFood,
  addFoodEntry,
  deleteFoodEntry,
  updateMealTime,
  getRecommendedFoods
};
