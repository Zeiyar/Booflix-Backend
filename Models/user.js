const mongoose = require ("mongoose");

const UserSchema = new mongoose.Schema({
    email : {type:String, required:true, unique:true},
    password : {type:String, required:true},
    subscription : {
        type : {
            plan : {type: String, default:"Free"},
            ipList : {type: [String],default:[]},
            createdAt : {type: Date, default: Date.now},
            },
        },
    tokenVersion: {type:Number , default:0},
}, {timestamps:true});

module.exports = mongoose.model("User",UserSchema);