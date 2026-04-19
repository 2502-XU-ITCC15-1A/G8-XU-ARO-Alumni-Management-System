const Application = require("../models/IdApplication");

exports.createApplication = async (req, res) => {
  const app = await Application.create({
    alumni: req.user.id
  });

  res.json(app);
};

exports.getMyApplications = async (req, res) => {
  const apps = await Application.find({ alumni: req.user.id });
  res.json(apps);
};

exports.getAllApplications = async (req, res) => {
  const apps = await Application.find().populate("alumni");
  res.json(apps);
};

exports.updateStatus = async (req, res) => {
  const updated = await Application.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json(updated);
};