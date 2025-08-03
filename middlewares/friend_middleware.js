const Joi = require('joi');

const removeFriendSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  friend_id: Joi.number().integer().positive().required()
});


const getFriendSchema = Joi.object({
  user_id: Joi.number().integer().positive().required()
});

function validateGetFriend(req, res, next) {
  const { error } = getFriendSchema.validate(req.params);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}



const getFriendInfoSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  friend_id: Joi.number().integer().positive().required()
});

function validateGetFriendInfo(req, res, next) {
  const { error } = getFriendInfoSchema.validate(req.params);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}

module.exports = validateGetFriendInfo;

module.exports = validateGetFriend,validateGetFriendInfo;