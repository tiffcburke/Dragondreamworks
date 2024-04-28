const Joi = require('joi');

module.exports.emailSchema = Joi.object({
        title: Joi.string().required(),
        deadline: Joi.string().required(),
        description: Joi.string().required(),
        purpose: Joi.string().required(),
        budget: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().required()
    });

