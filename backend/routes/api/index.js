const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('this is api page')
})
router.get('/:id', (req, res) => {
    req.params.id ? res.send(`this is api page with id ${req.params.id}`) : res.send('you must enter id')
})
module.exports = router