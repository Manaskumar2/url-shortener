const mongoose=require('mongoose')


const urlSchema =new mongoose.Schema({

urlCode:{
    type:String,
    unique:true,
    required:true,
    lowerCase:true,
    trim:true
},
longUrl:{
    type:String,
    required:true
},
shortUrl:{
    type:String,
    required:true,
    unique:true

}


},{
    timestamps:true
});
module.exports=mongoose.Model('Url',urlSchema)