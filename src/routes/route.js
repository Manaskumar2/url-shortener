const express = require('express');
const router =express.Router()
const urlController=require('../controllers/urlController')

router.post('/test-me', function(req,res){
    res.send({msg:"this is first api"})
})

router.post('/url/shorten',urlController.createUrl)




module.exports=router