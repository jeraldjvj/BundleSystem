import { bundleModelRepository } from '../repositories/bundleModel.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const bundleModelController = {
  async getAll(_req, res) {
    res.json(await bundleModelRepository.findAll());
  },

  async getById(req, res) {
    const bundleModel = await bundleModelRepository.findById(req.params.bundle_model_id);
    if (!bundleModel) throw new HttpError(404, 'Bundle model not found');
    res.json(bundleModel);
  },

  async create(req, res) {
    const bundleModel = await bundleModelRepository.create(req.body);
    res.status(201).json(bundleModel);
  },

  async update(req, res) {
    const bundleModel = await bundleModelRepository.update(req.params.bundle_model_id, req.body);
    if (!bundleModel) throw new HttpError(404, 'Bundle model not found');
    res.json(bundleModel);
  },

  async remove(req, res) {
    const deleted = await bundleModelRepository.remove(req.params.bundle_model_id);
    if (!deleted) throw new HttpError(404, 'Bundle model not found');
    res.status(204).send();
  },
};
