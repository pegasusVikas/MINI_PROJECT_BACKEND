const express = require('express');
const router = express.Router();
const authorization = require("../../middleware/authirization");
const Student=require('../../models/student')
const { ADMIN, COMPANY, STUDENT } = require('../../others/roles');
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