
const urlModel=require("../models/urlModel")
const shortId=require('shortid')
const validUrl=require('valid-url')
// const { create } = require("../models/urlModel")
const baseurl="http://localhost:3000"

//=================================== Create Url Api================================================================

let createUrl=async function(req,res){
    try {
        let body = req.body
        
        const {longUrl}=req.body
        
        if (Object.keys(body).length==0){
            return res.status(400).send({status:false,message:"Body should not be empty"})
        }
        
        if(!body.longUrl){
            return res.status(400).send({status:false,message:"longUrl is mandotary"})
        }
        
        if(!validUrl.isHttpsUri(longUrl)){
            return  res.status(400).send({status:false,message:"Invalid LongUrl"})
        }
        if(!validUrl.isUri(baseurl)){
            return res.status(400).send({status:false,message:"Invalid Baseurl"})
        }
        
        let checkUrl=await urlModel.findOne({longUrl:longUrl}).select({_id:0,__v:0,createdAt:0,updatedAt:0})
        
        if(checkUrl){
            return res.status(200).send({status:true,data:checkUrl})
        }
        
        let generateUrl= shortId.generate(longUrl).toLowerCase()
                
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

        let filter={longUrl:create.longUrl,shortId:create.shortUrl,urlCode:create.urlCode}

        
        res.status(201).send({status:true,message:"Success",data:filter})
        
        
    } catch (error) {
        
        return res.status(500).send({status:false,message:error.message})
    }
}

//=================================== get Url Api================================================================

let getUrl= async function (req,res){
    try {
        let urlCode=req.params.urlCode

        //----------validation for Url code----------------
        
        if (!urlCode){
            return res.status(400).send({status:false,message:"please give urlCode"})
        }
        
        if (!shortId.isValid(urlCode)){
            return res.status(400).send({status:false,message:"Invalid urlCode"})
        }
        //---------- uniqeness for Url code----------------
        
        let checkUrlCode= await urlModel.findOne({urlCode:urlCode})
        
        if(!checkUrlCode){
            return res.status(404).send({status:false,message:"No url found"})
        }
        //---------- Redirecting for LongUrl ----------------
        
        return res.status(302).redirect(checkUrlCode.longUrl)
        
    } catch (error) {
    return res.status(500).send({status:false,message:error.message})
        
    }
}

module.exports={
    createUrl,getUrl
}