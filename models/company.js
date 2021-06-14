const mongoose = require('mongoose');
const { COMPANY } = require('../others/roles');
const CompanySchema = mongoose.Schema({
  companyName: {
    type: String,
    default: ''
  },
  companyEmail: {
    type: String,
    default: '',
    unique: true
  },
  companyPhone: {
    type: String,
    default: '',
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: COMPANY
  },
  createdAt: {
    type: Date,
    default: Date
  },
  jobId:
    [ {type: mongoose.Schema.Types.ObjectId, ref: 'Jobs'} ]
});
module.exports = mongoose.model('Companies', CompanySchema);
