const express = require('express')
const cors = require('cors');
const connection = require('../../db/connection')
const songModel = require('../../db/songSchema')

const router = express.Router()
connection(()=>{
    songModel.find({}).then((data,err)=>{
        if(err){
            console.log(err)
        }else{
            console.log(data)
            router.get('/songlist', (req, res) => {
                res.json(data)
            })
        }
    })
    



},(err)=>{console.log(err)})
router.get('/', (req, res) => {
    res.json({url: 'http://127.0.0.1:3000/localmusics/1141641196.mp3'})
})


module.exports = router