const express = require('express');
const router = express.Router();
const authorization = require('../../middleware/authirization');

const Job = require('../../models/job');
const Student=require('../../models/student')
const { ADMIN,COMPANY, STUDENT } = require('../../others/roles');
const xlsxFile = require('read-excel-file/node');

router.get('/', authorization, (req, res) => {
  const { _id, role } = req.user;

  if (role === COMPANY)
    return Job.find({ _companyId: _id })
      .then(jobs => res.status(200).send(jobs))
      .catch(error => res.status(400).send({ message: error.message }));

  Job.find({})
    .then(jobs => res.status(200).send(jobs))
    .catch(error => res.status(400).send({ message: error.message }));
});

router.post('/', authorization, (req, res) => {
  const { _id, role } = req.user;
  const { title, description,salary,slots,deadline,schoolPercentage,interPercentage,btechPercentage } = req.body;

  if (role !== COMPANY)
    return res.status(401).send({ err: 'only companies can post jobs' });

  const job = new Job({
    _companyId: _id,
    title,
    description,
    salary,
    slots,
    deadline,
    schoolPercentage,
    interPercentage,
    btechPercentage
  });

  job
    .save()
    .then(data => res.status(200).send(data))
    .catch(error => res.status(400).send({ message: error.message }));
});

router.get('/:id', authorization, (req, res) => {
  const { _id, role } = req.user;

  if (role === COMPANY)
    return Job.find({ _id: req.params.id, _companyId: _id })
      .then(job => res.status(200).send(job))
      .catch(error => res.status(400).send({ message: error.message }));

  Job.findById(req.params.id)
    .then(job => res.status(200).send(job))
    .catch(error => res.status(400).send({ message: error.message }));
});

router.patch('/:id/apply', authorization, (req, res) => {
  const { _id, role } = req.user;

  if (role !== STUDENT)
    return res.status(401).send({ message: 'Access denied.' });

  Job.findById(req.params.id)
    .then(job => {
      const plainJob = job.toObject();
      const applicants = plainJob.applicants;
      applicants.push(_id);
      Student.findById(_id).then(student=>{
        const plainstudent=student.toObject();
        const applied=plainstudent.applied;
        applied.push(req.params.id)
        Student.updateOne({_id}, { $set: { applied } }).then(ps=>{
          Job.updateOne({ _id: req.params.id }, { $set: { applicants } }).then(num=>{
            res.status(200).send({message:num})
          });
        })  
      })
      .catch(error => res.status(400).send({ message: error.message }));
    })
    .catch(error => res.status(400).send({ message: error.message }));
});
router.post('/:id/upload',authorization, async (req,res) =>{
  const {id}=req.params
  const{role}=req.user
  if (role === STUDENT)
    return res.status(401).send({err:'only admin can upload'});
  if (role === COMPANY)
    return res.status(401).send({err:'only admin can upload' });
  if (role === ADMIN){
    try{
  xlsxFile('./adv.xlsx').then(async (rows) => {
      cols=[]
  for (i in rows){
            cols.push(rows[i][0]);        
  }
  console.log(cols);
  quali=[]
  for(let j=1;j<cols.length;j++){
      const student = await Student.findOne({ rollNo:cols[j] });
      if (student){
        quali.push(cols[j].toObject)
      }
  }
  Job.findByIdAndUpdate(id,{qualified:quali},(err,doc)=>{
    if(err){
      res.status(400).send({message:err.message})
    }
    else{
      res.status(200).send({job:doc})
    }
  })
  })
  }
  catch(err){res.status(400).send({err})}
  }
  
});
router.delete('/:id', authorization, (req, res) => {
  const { _id, role } = req.user;

  if (role === STUDENT)
    return res.status(401).send({ message: 'Access denied.' });

  if (role === COMPANY)
    return Job.deleteOne({ _id: req.params.id, _companyId: _id })
      .then(success => res.status(200).send(success.deletedCount.toString()))
      .catch(error => res.status(400).send({ message: error.message }));

  Job.deleteOne({ _id: req.params.id })
    .then(success => res.status(200).send(success.deletedCount.toString()))
    .catch(error => res.status(400).send({ message: error.message }));
});

module.exports = router;
