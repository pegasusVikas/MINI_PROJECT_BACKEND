const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer=require('nodemailer')
const Admin = require('../../models/admin');
const Company = require('../../models/company');
const Student = require('../../models/student');
const config=require('config')
const key=config.get('JWT_SECRET')
const { ADMIN, COMPANY, STUDENT } = require('../../others/roles');
//const { validateSignUp, validateLogIn } = require('../../validation');
//const { EACCES, ENAMETOOLONG } = require('constants');

router.post('/signup/:role', async (req, res) => {
  try{
    const { role } = req.params;
    const {email,password} = req.body;
    const isEmailExistInAdmins = await Admin.findOne({ email });
    const isEmailExistInCompanies = await Company.findOne({ companyEmail:email});
    const isEmailExistInStudents = await Student.findOne({ email });
  
    if (isEmailExistInAdmins || isEmailExistInCompanies || isEmailExistInStudents)
      return res.status(400).send({
        message: 'The email address is already in use by another account.'
      });
  
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
  
    if (role === COMPANY) {
      const {  companyName,companyPhone} = req.body;
      const company = new Company({
        companyName,
        companyEmail:email,
        companyPhone,
        password: hash,
        jobId:[]
      });
  
      const token = jwt.sign({ _id: company._id, role }, key);
  
      company
        .save()
        .then(data => {
          const user = data.toObject();
          delete user.password;
  
          res.status(201).send({ user, token });
        })
        .catch(error => res.status(400).send({ message: error.message }));
    } else if (role === STUDENT) {
      console.log('hi');
      const {  firstName,lastName,phoneNo,rollNo,schoolPercentage,interPercentage,btechPercentage,
      Class} = req.body;
      //const { error } = validateSignUp(req.body);
      // if (error){
      //   console.log("bye")
      //   return res.status(400).send({ message: error.message });
      // } 
      const student = new Student({
        firstName,
        lastName,
        phoneNo,
        rollNo,
        Class,
        email: email,
        password: hash,
        schoolPercentage,
        interPercentage,
        btechPercentage
      });
  
      const token = jwt.sign({ _id: student._id, role }, key);
  
      student
        .save()
        .then(data => {
          const user = data.toObject();
          delete user.password;
          res.status(201).send({ user, token });
        })
        .catch(error =>{
        console.log(error.message)
        res.status(400).send({ message: error.message })} );
      jwt.sign(
        {
          _id: student._id,
        },
        key,
        {
          expiresIn: '1d',
        },
        (err, emailToken) => {
          const url = `http://localhost:4000/api/user/confirmation/${emailToken}`;
          if(err){
            console.log(err)
          }
          const to= email;
          const subject= 'Confirm Email';
          const html= `Please click this email to confirm your email: <a href="${url}">${url}</a>`;
          sendemail(to,subject,html);
        },
      );
    }
  }
  catch(error){
    console.log(error.message)
  }
});
router.get('/confirmation/:token', async (req, res) => {
  try {
    const { _id } = jwt.verify(req.params.token, key);
    Student.findByIdAndUpdate(_id,{status:'authorized'},(err)=>{
      if(err){
        res.status(400).send({message:err.message})
      }
      else{
        res.status(200).send({message:'sucessfully authorized student'})
        
      }
    })
  } catch (e) {
    res.send('error');
  }
});
router.post('/login/:role', async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  //const { error } = validateLogIn(req.body);
  //if (error) return res.status(400).send({ message: error.message });

  if (role === ADMIN) {
    const user = await Admin.findOne({ email });

    if (!user)
      return res.status(400).send({
        message: 'There is no user record corresponding to this identifier.'
      });

    const checkPassword = (password==user.password);
    if (!checkPassword)
      return res.status(400).send({ message: 'The password is invalid.' });

    const token = jwt.sign({ _id: user._id, role }, key);

    const userData = user.toObject();
    delete userData.password;

    res.status(200).send({ user: userData, token });
  } else if (role === COMPANY) {
    const user = await Company.findOne({ companyEmail:email });

    if (!user)
      return res.status(400).send({
        message: 'There is no user record corresponding to this identifier.'
      });

    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword)
      return res.status(400).send({ message: 'The password is invalid.' });

    const token = jwt.sign({ _id: user._id, role }, key);

    const userData = user.toObject();
    delete userData.password;

    res.status(200).send({ user: userData, token });
  } else if (role === STUDENT) {
    const user = await Student.findOne({ email });
    //if (user.status=='pending'){
     // return res.status(400).send({message:'the admin has to authorize'})
//}
    if (!user)
      return res.status(400).send({
        message: 'There is no user record corresponding to this identifier.'
      });

    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword)
      return res.status(400).send({ message: 'The password is invalid.' });

    const token = jwt.sign({ _id: user._id, role }, key);

    const userData = user.toObject();
    delete userData.password;

    res.status(200).send({ user: userData, token });
  }
});

module.exports = router;
