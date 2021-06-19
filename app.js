const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const logger = require('morgan');
const cors = require('cors');
const config=require('config')
const authRouter = require('./routes/auth/auth');
const adminrouter=require('./routes/admin/admin')
const companiesRouter = require('./routes/company/company');
const studentsRouter = require('./routes/student/student');
const jobsRouter = require('./routes/job/jobs');
const profileRouter = require('./others/profile');
const fileRouter=require('./routes/file/file')
const db=config.get('MONGO_DB_URI')
const Gmail_user=config.get('GUSER')
const Gmail_pass=config.get('GPASS')
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};
const nodemailer=require('nodemailer');
mongoose
  .connect(db, options)
  .then(() => console.log('Connected to DB!'))
  .catch(error => console.log(error));

const app = express();
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: Gmail_user,
    pass: Gmail_pass,
  },
});
global.sendemail =(to,subject,html)=>{
  transporter.sendMail({
    to: to,
    subject: subject,
    html:html,
  }).then((sut)=>{
    console.log(sut)
  })
  .catch((err)=>{
    console.log(err)
  })
}
app.use(helmet());
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/user', authRouter);
app.use('/api/college', adminrouter);
app.use('/api/company', companiesRouter);
app.use('/api/student', studentsRouter);
app.use('/api/job', jobsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/file',fileRouter)
app.use('/',(req, res) => res.send('404 - Notr Found'));

module.exports = app;
