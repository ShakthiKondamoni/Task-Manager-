import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

async function canAccessProject(user, projectId) {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return user.role === 'ADMIN' || project.members.map(String).includes(String(user._id));
}

router.get('/', protect, async (req, res) => {
  const filter = req.user.role === 'ADMIN' ? {} : { assignedTo: req.user._id };
  const tasks = await Task.find(filter)
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1 });
  res.json(tasks);
});

router.post('/', protect, adminOnly, async (req, res) => {
  const { title, description, dueDate, project, assignedTo } = req.body;
  if (!title || !dueDate || !project || !assignedTo) {
    return res.status(400).json({ message: 'Title, due date, project and assignee are required' });
  }

  const foundProject = await Project.findById(project);
  if (!foundProject) return res.status(404).json({ message: 'Project not found' });
  if (!foundProject.members.map(String).includes(String(assignedTo))) {
    return res.status(400).json({ message: 'Assignee must be a project member' });
  }

  const task = await Task.create({ title, description, dueDate, project, assignedTo, createdBy: req.user._id });
  res.status(201).json(task);
});

router.patch('/:id', protect, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const allowed = req.user.role === 'ADMIN' || String(task.assignedTo) === String(req.user._id);
  if (!allowed) return res.status(403).json({ message: 'Not allowed' });

  const allowedUpdates = req.user.role === 'ADMIN'
    ? ['title', 'description', 'status', 'dueDate', 'assignedTo']
    : ['status'];

  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) task[key] = req.body[key];
  }

  await task.save();
  res.json(task);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

export default router;
