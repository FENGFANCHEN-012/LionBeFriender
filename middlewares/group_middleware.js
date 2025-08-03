const Joi = require('joi');

const updateGroupParamsSchema = Joi.object({
  group_id: Joi.number().integer().positive().required()
});

const updateGroupBodySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(500).required(),
  photo_url: Joi.string().uri().optional().allow('', null)
});

function validateUpdateGroup(req, res, next) {
  const paramValidation = updateGroupParamsSchema.validate(req.params);
  if (paramValidation.error) {
    return res.status(400).json({ error: paramValidation.error.details[0].message });
  }

  const bodyValidation = updateGroupBodySchema.validate(req.body);
  if (bodyValidation.error) {
    return res.status(400).json({ error: bodyValidation.error.details[0].message });
  }

  next();
}

module.exports = validateUpdateGroup;