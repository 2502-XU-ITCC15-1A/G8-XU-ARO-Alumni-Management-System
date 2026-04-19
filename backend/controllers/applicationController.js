// controllers/applicationController.js
import Application from "../../AlumniMS/backend/models/Application.js";

export const createApplication = async (req, res) => {
  const app = await Application.create({
    alumni: req.user.id
  });

  res.json(app);
};

export const getMyApplications = async (req, res) => {
  const apps = await Application.find({ alumni: req.user.id });
  res.json(apps);
};