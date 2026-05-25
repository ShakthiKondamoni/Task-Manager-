import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const filter = req.user.role === 'ADMIN' ? {} : { members: req.user._id };
  const projects = await Project.find(filter).populate('members', 'name email role').populate('createdBy', 'name email');
  res.json(projects);
});

router.post('/', protect, adminOnly, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required' });

  const project = await Project.create({ name, description, createdBy: req.user._id, members: [req.user._id] });
  res.status(201).json(project);
});

router.post('/:id/members', protect, adminOnly, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Member email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  if (!project.members.map(String).includes(String(user._id))) project.members.push(user._id);
  await project.save();
  res.json(await project.populate('members', 'name email role'));
});

export default router;
