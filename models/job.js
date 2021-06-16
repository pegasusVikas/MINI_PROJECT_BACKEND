const mongoose = require('mongoose');

const JobSchema = mongoose.Schema({
  _companyId: {
    type: mongoose.Schema.Types.ObjectId
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  salary: {
    type:Number,
    required:true
  },
  slots: {
    type:Number,
    required:true
  },
  applicants: [{type:mongoose.Schema.Types.ObjectId,ref:'Students'}],
  qualified: [{type:mongoose.Schema.Types.ObjectId,ref:'Students'}],
  createdAt: {
    type: Date,
    default: Date
  },
  deadline:{
    type:Date,
    default:Date.now()
  },
  schoolPercentage:{
    type:Number,
    required:true
  },
  interPercentage:{
    type:Number,
    required:true
  },
  btechPercentage:{
    type:Number,
    required:true
  },
  type:{
    type:String,
    required:true
  }
});

module.exports = mongoose.model('Jobs', JobSchema);
