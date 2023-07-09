const PORT=3000
const express=require('express')
const cors=require('cors')

const app=express()
app.use(cors())
app.use(express.json())
require('dotenv').config()

const { Configuration, OpenAIApi } = require("openai");
const fs=require('fs')
const multer=require('multer')


const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const storage=multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,'public')
  },
  filename: (req,file,cb)=>{
    console.log('file',file)
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({storage: storage}).single('file')
let filePath

app.post('/images',async(req,res)=>{
    try{
      const response = await openai.createImage({
        prompt: req.body.message,
        n: 10,
        size: "1024x1024",
      })
      console.log(response);
      res.send(response.data.data);
    }catch(error){
      console.error(error);
    }
})

app.post("/upload",(req,res)=>{
  upload(req,res,(err)=>{
    if(err instanceof multer.MulterError){
      return res.status(500).json(err)
    }else if(err){
      return res.status(500).json(err)
    }
    filePath=req.file.path
  })
})

app.post('/variations',async(req,res)=>{
  try{
      const response = await openai.createImageVariation(
          fs.createReadStream(filePath),
          2,
          "1024x1024"
         )
         res.send(response.data.data)
      }catch(error){
        console.error(error);
      }

})

app.listen(PORT,()=>console.log('Your server is runnning on PORT ' + PORT));
