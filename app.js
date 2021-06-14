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
const db=config.get('MONGO_DB_URI')
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

mongoose
  .connect(db, options)
  .then(() => console.log('Connected to DB!'))
  .catch(error => console.log(error));

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/user', authRouter);
app.use('/api/college', adminrouter);
app.use('/api/companies', companiesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/profile', profileRouter);

app.use((req, res) => res.status(404).send('404 - Not Found'));

module.exports = app;
