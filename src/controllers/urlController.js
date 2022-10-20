
const urlModel=require("../models/urlModel")
const shortId=require('shortid')
const validUrl=require('valid-url')
const baseurl="http://localhost:3000"
const redis=require('redis')
const {promisify}=require('util')

//---------------------------------------- Caching process------------------------------------------------------------------------------------

const redisClient = redis.createClient(
    15984,
    "redis-15984.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("rNej1h645Ci9IMVnTaN4EfNEHubi7rvg", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  
  
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


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

        // let flag=0
        
        // await axios.get(longUrl).then(function (response) {
        //   console.log("success");
        // }).catch(function (error) {
        //   flag=1
        // });
        
        // if(flag==1)
        // return res.status(400).send({status:false,message:"Please send valid Url"})



        if(!validUrl.isHttpsUri(longUrl)){
            return  res.status(400).send({status:false,message:"Invalid LongUrl"})
        }
        if(!validUrl.isUri(baseurl)){
            return res.status(400).send({status:false,message:"Invalid Baseurl"})
        }
        
    let checkUnique= await GET_ASYNC(`${longUrl}`)
    if(checkUnique){
    
    return res.status(200).send({status:true,message:"LongUrl already Shortned",data:JSON.parse(checkUnique)})
    }
        
        let checkUrl=await urlModel.findOne({longUrl:longUrl}).select({_id:0,__v:0,createdAt:0,updatedAt:0})

        if(checkUrl){
        await SET_ASYNC(`${longUrl}`,JSON.stringify(checkUrl))
        
        return res.status(200).send({status:true,data:checkUrl})}

    
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

        let filter={longUrl:create.longUrl,shortUrl:create.shortUrl,urlCode:create.urlCode}

        
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
        
    let checkCached= await GET_ASYNC(`${urlCode}`)

//------------------ Hit ---------------------------------------

if(checkCached){
    return res.status(200).redirect(JSON.parse(checkCached))
}else{
    
    let checkUrlCode= await urlModel.findOne({urlCode:urlCode})
    
    if(!checkUrlCode){
        return res.status(404).send({status:false,message:"No url found"})}
        
//------------------ Miss ---------------------------------------

    await SET_ASYNC(`${urlCode}`,JSON.stringify(checkUrlCode.longUrl))
    
        return res.status(302).redirect(checkUrlCode.longUrl)
                 
}  
    } catch (error) {
    return res.status(500).send({status:false,message:error.message})
        
    }
}

//=================================================================================================

module.exports={
    createUrl,getUrl
}
