const mongoose = require('mongoose');
const { type } = require('os');

const { STUDENT } = require('../others/roles');

const StudentSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    default:""
  },
  phoneNo: {
    type: String,
    default: '',
    unique:true
  },
  rollNo: {
    type: String,
    required: true,
    unique:true
  },
  email: {
    type: String,
    required: true,
    unique:true
  },
  password: {
    type: String,
    required: true
  },
  Class:{
    type: String,
    required:true
  },
  role: {
    type: String,
    default: STUDENT
  },
  createdAt: {
    type: Date,
    default: Date
  },
  schoolPercentage:{
    type:Number,
    required: true
  },
  interPercentage:{
    type:Number,
    required: true
  },
  btechPercentage:{
    type:Number,
    required: true
  },
  applied: [{type:mongoose.Schema.Types.ObjectId,ref:'Jobs'}],
  status:{
    type:String,
    default:'pending'
  }
});

module.exports = mongoose.model('Students', StudentSchema);
