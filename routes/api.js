let router = require('express').Router()
let { findOrCreateContactAndCreateDeal } = require('../controllers/apiController')

// define route for '/'
router.get('/', findOrCreateContactAndCreateDeal)

module.exports = router