// controllers/videoTaskController.js
const sql    = require('mssql');
const config = require('../dbConfig');
const Tasks  = require('../models/video_task_model');
const Watches= require('../models/video_watch_model');
const Points = require('../models/points_model');

/**
 * @swagger
 * /video-tasks:
 *   get:
 *     summary: List all video tasks
 *     tags: [Video Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of video tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 */
exports.listTasks = async (req, res, next) => {
  try {
    const tasks = await Tasks.getAll();
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /video-tasks/{task_id}:
 *   get:
 *     summary: Get a single video task by ID
 *     tags: [Video Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Video task ID
 *     responses:
 *       200:
 *         description: Video task found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   type: object
 *       404:
 *         description: Task not found
 */
exports.getTask = async (req, res, next) => {
  try {
    const taskId = req.params.task_id;
    const task = await Tasks.getById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /video-watches:
 *   post:
 *     summary: Complete a video task and earn points
 *     tags: [Video Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *             properties:
 *               task_id:
 *                 type: integer
 *                 description: The ID of the video task to complete
 *     responses:
 *       200:
 *         description: Points awarded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 added:
 *                   type: integer
 *       400:
 *         description: Task already completed
 */
exports.completeTask = async (req, res, next) => {
  const userId = req.user.user_id;
  const { task_id } = req.body;
  let pool;

  try {
    // 1) Prevent double‑awarding
    if (await Watches.hasWatched(userId, task_id)) {
      return res.status(400).json({ msg: 'Task already completed' });
    }

    // 2) Begin transaction
    pool = await new sql.ConnectionPool(config).connect();
    const trx = new sql.Transaction(pool);
    await trx.begin();

    // 3) Record the watch
    await Watches.recordWatch(userId, task_id, trx);

    // 4) Award points
    const task = await Tasks.getById(task_id);
    await Points.addPoints(userId, task.point_value);

    // 5) Commit
    await trx.commit();
    res.json({ msg: 'Points awarded', added: task.point_value });
  } catch (err) {
    if (pool) await pool.close().catch(() => {});
    next(err);
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
};
