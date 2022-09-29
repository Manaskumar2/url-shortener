
const urlModel=require("../models/urlModel")
const shortId=require('shortid')
const validUrl=require('valid-url')
// const { create } = require("../models/urlModel")
const baseurl="http://localhost:3000"


let createUrl=async function(req,res){
    try {
        let body = req.body

        let {longUrl}=body
        
        if (Object.keys(body).length==0){
           return res.status(400).send({status:false,message:"Body should not be empty"})
        }

        if(!body.longUrl){
            return res.status(400).send({status:false,message:"longUrl is mandotary"})
        }

        if(!validUrl.isUri(longUrl)){
          return  res.status(400).send({status:false,message:"Invalid LongUrl"})
        }
        if(!validUrl.isUri(baseurl)){
            return res.status(400).send({status:false,message:"Invalid Baseurl"})
        }

        let checkUrl=await urlModel.findOne({longUrl:longUrl})

        if(checkUrl){
            return res.status(409).send({status:false,message:"long url already shortened",data:checkUrl})
        }

        let generateUrl= shortId.generate(longUrl)
        
        // res.status(201).send({status:true,message:"urlcode created succesfully",urlCode:generateUrl})

        let createShortUrl=baseurl+"/"+generateUrl

        body.urlCode=generateUrl
        body.shortUrl=createShortUrl

if(!body.urlCode){
    return res.status(400).send({status:false,message:"urlCode is mandotary"})
}
if(!body.shortUrl){
    return res.status(400).send({status:false,message:"shortUrl is mandotary"})
}

        let create= await urlModel.create(body)

        res.status(201).send({status:true,message:"Success",data:create})

        
    } catch (error) {
        
       return res.status(500).send({status:false,message:error.message})
    }
}



let getUrl= async function (req,res){
    try {
        let urlCode=req.params.urlCode

        if (!urlCode){
            return res.status(400).send({status:false,message:"please give urlCode"})
        }

        if (!shortId.isValid(urlCode)){
            return res.status(400).send({status:false,message:"Invalid urlCode"})
        }

        let checkUrlCode= await urlModel.findOne({urlCode:urlCode})

        if(!checkUrlCode){
            return res.status(400).send({status:false,message:"No url found"})
        }

        return res.status(302).redirect(checkUrlCode.longUrl)
        
    } catch (error) {
    return res.status(500).send({status:false,message:error.message})
        
    }
}

module.exports={
    createUrl,getUrl
}