const model = require("../models/managemed_model");

/**
 * @swagger
 * /medications:
 *   get:
 *     summary: Get all medications
 *     tags: [Medications]
 *     responses:
 *       200:
 *         description: List of medications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Failed to fetch medications
 */
async function getAllMedications(req, res) {
  try {
    const meds = await model.getAllMedications();
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch medications" });
  }
}

/**
 * @swagger
 * /medications/{id}:
 *   get:
 *     summary: Get a medication by ID
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Medication data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Medication not found
 */
async function getMedicationById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const med = await model.getMedicationById(id);
  if (med) {
    res.json(med);
  } else {
    res.status(404).json({ error: "Medication not found" });
  }
}

/**
 * @swagger
 * /medications:
 *   post:
 *     summary: Create a new medication
 *     tags: [Medications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Medication created
 *       500:
 *         description: Failed to create medication
 */
async function createMedication(req, res) {
  try {
    const med = await model.createMedication(req.body);
    res.status(201).json(med);
  } catch (err) {
    res.status(500).json({ error: "Failed to create medication" });
  }
}

/**
 * @swagger
 * /medications/{id}:
 *   delete:
 *     summary: Delete a medication by ID
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Medication deleted
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Medication not found
 */
async function deleteMedicationById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const result = await model.deleteMedicationById(id);
  if (result) {
    res.json({ message: `Medication ID ${id} deleted.` });
  } else {
    res.status(404).json({ error: "Medication not found" });
  }
}

/**
 * @swagger
 * /medications/history:
 *   get:
 *     summary: Get medication intake history
 *     tags: [Medications]
 *     responses:
 *       200:
 *         description: List of medication intake logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Failed to fetch medication history
 */
async function getMedicationHistory(req, res) {
  try {
    const history = await model.getMedicationHistory();
    res.json(history);
  } catch (err) {
    console.error("Error fetching medication history:", err);
    res.status(500).json({ error: "Failed to fetch medication history" });
  }
}

/**
 * @swagger
 * /medications/{id}/taken:
 *   post:
 *     summary: Log a medication as taken
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Medication marked as taken
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Failed to log medication
 */
async function logMedicationTaken(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const result = await model.logMedicationTaken(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to log medication" });
  }
}

/**
 * @swagger
 * /medications/{id}/mark:
 *   post:
 *     summary: Mark medication as taken (alternative endpoint)
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Marked as taken
 *       400:
 *         description: Invalid medication ID
 *       500:
 *         description: Failed to mark medication
 */
async function markAsTaken(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid medication ID" });
  }

  try {
    await model.markMedicationAsTaken(id);
    res.status(200).json({ message: "Marked as taken" });
  } catch (err) {
    console.error("Error marking as taken:", err);
    res.status(500).json({ error: "Failed to mark medication" });
  }
}

/**
 * @swagger
 * /medications/{id}:
 *   put:
 *     summary: Update a medication by ID
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medication ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Medication updated
 *       400:
 *         description: Invalid ID
 *       500:
 *         description: Update failed
 */
async function updateMedicationById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const updated = await model.updateMedicationById(id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating:", err);
    res.status(500).json({ error: "Update failed" });
  }
}

module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
  deleteMedicationById,
  getMedicationHistory,
  logMedicationTaken,
  markAsTaken,
  updateMedicationById
};
