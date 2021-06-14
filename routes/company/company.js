const express = require('express');
const router = express.Router();
const authorization = require('../../middleware/authirization');
const Company = require('../../models/company');

const { ADMIN, COMPANY } = require('../../others/roles');

router.get('/', authorization, (req, res) => {
  if (req.user.role === COMPANY)
    return res.status(401).send({ message: 'Access denied.' });

  Company.find({})
    .then(companies => res.status(200).send(companies))
    .catch(error => res.status(400).send({ message: error.message }));
});

router.get('/:id', authorization, (req, res) => {
  if (req.user.role === COMPANY)
    return res.status(401).send({ message: 'Access denied.' });

  Company.findById(req.params.id)
    .then(company => res.status(200).send(company))
    .catch(error => res.status(400).send({ message: error.message }));
});

router.delete('/:id', authorization, (req, res) => {
  if (req.user.role !== ADMIN)
    return res.status(401).send({ message: 'Access denied.' });

  Company.deleteOne({ _id: req.params.id })
    .then(success => res.status(200).send(success.deletedCount.toString()))
    .catch(error => res.status(400).send({ message: error.message }));
});

module.exports = router;
