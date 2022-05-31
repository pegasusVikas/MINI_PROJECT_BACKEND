const express = require('express');
const router = express.Router();
const authorization = require("../../middleware/authirization");
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const Student=require('../../models/student')
const { ADMIN, COMPANY, STUDENT } = require('../../others/roles');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {

      // Uploads is the Upload_folder_name
      
      if(req.url=="/uploadProfilePicture")
      cb(null, "file/profile")
      else if(req.url=="/uploadResume")
      cb(null, "file/resume")
      else if(req.url=="/uploadShortlist")
      cb(null, "file/shortlist")
      else
      cb(null, "/")
  },
  filename: function (req, file, cb) {
    if(req.url=="/uploadProfilePicture")
    cb(null, req.user._id+".jpg")
    else if(req.url=="/uploadResume")
    cb(null, req.user._id+".pdf")
    else if(req.url=="/uploadShortlist")
    cb(null, req.user._id+".xls")
  }
})
     
const maxSize = 30 * 1000 * 1000;
  
var upload = multer({ 
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb){
  
      var filetypes;
      if(req.url=="/uploadProfilePicture")
      filetypes =/jpeg|jpg|png|/;
      else if(req.url=="/uploadResume")
      filetypes =/pdf/;
      else if(req.url=="/uploadShortlist")
      filetypes =/xlsx|xls/;
      else
      filetypes =/none/;
      
      var mimetype = filetypes.test(file.mimetype);

      var extname = filetypes.test(path.extname(
                  file.originalname).toLowerCase());
      
      if ((req.url=="/uploadShortlist"||mimetype) && extname) {
          return cb(null, true);
      }
      console.log("file only supports"+filetypes+" given "+file.mimetype)
      cb({err:"Error: File upload only supports the "
              + "following filetypes - " + filetypes});
    } 

}).single("profile");       


  
router.post("/uploadProfilePicture",authorization,function (req, res) {
  upload(req,res,function(err) {

      if(err) {
        console.log(err)
          res.status("400").send({err:"Failed to upload"});
      }
      else {
         console.log(req.url,"lol",req.baseUrl)
          res.send({message:"Success, Image uploaded!"})
      }
  })
})

router.post("/uploadResume",authorization,function (req, res) {
      
  upload(req,res,function(err) {

      if(err) {
        console.log(err)
          res.status(400).send({err:"Failed to upload pdf"});
      }
      else {
         console.log(req.url,"lol",req.baseUrl)
          res.send({message:"Success, Resume uploaded!"})
      }
  })
})

router.post("/uploadShortlist",authorization,function (req, res) {
  if(req.user.role==ADMIN){
  upload(req,res,function(err) {

      if(err) {
        console.log(err)
          res.status(400).send({err:"Failed to upload"});
      }
      else {
         console.log(req.url,"lol",req.baseUrl)
          res.send({message:"Success, sheet uploaded!"})
      }
  })
}else{
  res.status(404).send({err:"only admins can upload"})
}
})

router.get("/profile/:id",function (req, res) {
  console.log(path.resolve("/file/profile/"+req.params.id+".jpg"));
 
  res.sendFile("/file/profile/"+req.params.id+".jpg",{root:"."},(err)=>{
    if(err)
    res.sendFile("/file/profile/default.jpg",{root:"."},(err)=>{if(err)console.log(err)})
  })
  
})

router.get("/resume/:id",function (req, res) {
  res.sendFile("/file/resume/"+req.params.id+".pdf",{root:"."},(err)=>{
    if(err)
    res.sendFile("/file/resume/default.pdf",{root:"."},(err)=>{if(err)console.log(err)})
  })
})

router.post('/:id/authorize',authorization,async(req,res)=>{
    const{ id } =req.params
    const{role}=req.user
    if (role === STUDENT)
      return res.status(401).send({err:'only admin can authorize'});
    if (role === COMPANY)
      return res.status(401).send({err:'only admin can authorize'});
    if (role === ADMIN){
        Student.findByIdAndUpdate(id,{status:'authorized'},(err)=>{
            if(err){
              res.status(400).send({message:err.message})
            }
            else{
              res.status(200).send({message:'sucessfully authorized student'})
            }
          })
    }
})




module.exports = router;