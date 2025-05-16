const mongoose = require('mongoose');
const songSchema = new mongoose.Schema({  
    songName: {  
        type: String,  
        required: true  
    },  
    singer: {  
        type: String,  
        required: true  
    },  
    album: {  
        type: String,  
        required: false  
    },  
    duration: {  
        type: Number,  
        required: false  
    },  
    genre: {  
        type: String,  
        required: false  
    },  
    releaseDate: {  
        type: String,  
        required: false  
    },  
    songPath: {  
        type: String,  
        required: true  
    }, 
    imgPath: {
        type: String,
        required: true  
    },
    createdAt: {  
        type: Date,  
        default: Date.now  
    },  
    updatedAt: {  
        type: Date,  
        default: Date.now  
    }  
});  

module.exports = mongoose.model('Song', songSchema);