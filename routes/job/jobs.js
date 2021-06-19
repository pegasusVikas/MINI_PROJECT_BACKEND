const express = require('express');
const router = express.Router();
const authorization = require('../../middleware/authirization');

const Job = require('../../models/job');
const Student=require('../../models/student')
const Company =require('../../models/company')
const { ADMIN,COMPANY, STUDENT } = require('../../others/roles');
const xlsxFile = require('read-excel-file/node');

/*router.get('/:type', authorization, (req, res) => {
  const {type}=req.params
  Job.find({type})
    .then(job => res.status(200).send(job))
    .catch(error => res.status(400).send({ message: error.message }));
});
*/
router.post('/array/', authorization, (req, res) => {
  const {jobs}=req.body
  Job.find({_id:{$in:jobs}}).populate("_companyId").exec()
    .then(jobs => res.status(200).send(jobs))
    .catch(error => res.status(400).send({ message: error.message }))
});

router.get('/:jobId', authorization, (req, res) => {
  const {jobId}=req.params
  Job.findById(jobId).populate("_companyId").exec()
    .then(job => res.status(200).send(job))
    .catch(error => res.status(400).send({ message: error.message }))
});
router.post('/', authorization, (req, res) => {
  const { _id, role } = req.user;
  const { title, description,salary,slots,deadline,schoolPercentage,interPercentage,btechPercentage,type } = req.body;

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
    btechPercentage,
    type
  });

  job
    .save()
    .then(data => {
      Company.findById(_id).then(comp=>{
        comp.jobId.push(data._id)
        comp.save()
        res.status(200).send(data)
      })
    })
    .catch(error => res.status(400).send({ message: error.message }));
});

//get current jobs 
router.get('/current/:type', authorization, (req, res) => {
  const {type}=req.params;
  Job.find({type,deadline:{$gte:new Date().toISOString()}}).populate("_companyId").exec((err,docs)=>{
    if(err){
      return res.status(400).send({message:err.message});
    }
    else{
      return res.status(200).send(docs);
    }
  })
});

router.get('/expired/:type', authorization, (req, res) => {
  const {type}=req.params;
  Job.find({type,deadline:{$lt:new Date().toISOString()}}).populate("_companyId").exec((err,docs)=>{
    if(err){
      return res.status(400).send({message:err.message});
    }
    else{
      return res.status(200).send(docs);
    }
  })
});

router.post('/apply/:id', authorization, (req, res) => {
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
        Student.findOneAndUpdate({_id}, { $set: { applied }},{new:true}).then(ps=>{
          Job.findOneAndUpdate({ _id: req.params.id }, { $set: { applicants } },{new:true}).then(num=>{
            res.status(200).send({job:num,user:ps})
          });
        })  
      })
      .catch(error => res.status(400).send({ message: error.message }));
    })
    .catch(error => res.status(400).send({ message: error.message }));
});

router.delete('/reject/:jobId/:studentId', authorization, (req, res) => {
  const { _id, role } = req.user;
  const {jobId,studentId} =req.params
  if (role == STUDENT)
    return res.status(401).send({ message: 'Access denied.' });
 
  Job.findById({_id:jobId})
  .then((job)=>{
    
     if((role==COMPANY&&job._companyId!=_id)||role==STUDENT)
     return res.status(401).send({ message: 'Access denied.' });
     const temp=job.applicants.filter((id)=>id!=studentId);
     job.applicants=temp;
     job.save();
     
     res.send({_id:studentId})
  })
  .catch((err)=>{
      res.status(401).send({message:err.message})
  })
});

router.get('/:type/:companyid', authorization, (req, res) => {
  const { companyid,type } = req.params;
   Job.find({ type: type, _companyId: companyid }).populate("_companyId").exec((err,docs)=>{
    if(err){
      return res.status(400).send({message:err.message});
    }
    else{
      return res.status(200).send(docs);
    }
  })
});



router.post('/upload/:id',authorization, async (req,res) =>{
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
