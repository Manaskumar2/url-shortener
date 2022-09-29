const express = require('express');
const router =express.Router()
const {createUrl,getUrl}=require('../controllers/urlController')

router.post('/test-me', function(req,res){
    res.send({msg:"this is first api"})
})

router.post('/url/shorten',createUrl)
router.get('/:urlCode',getUrl)




module.exports=router