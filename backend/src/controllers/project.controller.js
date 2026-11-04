import { projectRepository } from '../repositories/project.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const projectController = {
  async getAll(_req, res) {
    res.json(await projectRepository.findAll());
  },

  async getById(req, res) {
    const project = await projectRepository.findById(req.params.project_id);
    if (!project) throw new HttpError(404, 'Project not found');
    res.json(project);
  },

  async create(req, res) {
    const project = await projectRepository.create(req.body);
    res.status(201).json(project);
  },

  async update(req, res) {
    // Al marcar completed guarda la fecha de fin; al reactivar la limpia
    if (req.body.status === 'completed' && !req.body.finish_date) {
      req.body.finish_date = new Date();
    } else if (req.body.status === 'active') {
      req.body.finish_date = null;
    }
    const project = await projectRepository.update(req.params.project_id, req.body);
    if (!project) throw new HttpError(404, 'Project not found');
    res.json(project);
  },

  async remove(req, res) {
    const deleted = await projectRepository.remove(req.params.project_id);
    if (!deleted) throw new HttpError(404, 'Project not found');
    res.status(204).send();
  },
};
