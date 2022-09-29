const express = require('express');
const router =express.Router()


router.post('/test-me', function(req,res){
    res.send({msg:"this is first api"})
})






module.exports=router