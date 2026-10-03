import { bundleRepository } from '../repositories/bundle.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const bundleController = {
  async getAll(_req, res) {
    res.json(await bundleRepository.findAll());
  },

  async getById(req, res) {
    const bundle = await bundleRepository.findById(req.params.bundle_id);
    if (!bundle) throw new HttpError(404, 'Bundle not found');
    res.json(bundle);
  },

  async create(req, res) {
    const bundle = await bundleRepository.create(req.body);
    res.status(201).json(bundle);
  },

  async update(req, res) {
    const bundle = await bundleRepository.update(req.params.bundle_id, req.body);
    if (!bundle) throw new HttpError(404, 'Bundle not found');
    res.json(bundle);
  },

  async remove(req, res) {
    const deleted = await bundleRepository.remove(req.params.bundle_id);
    if (!deleted) throw new HttpError(404, 'Bundle not found');
    res.status(204).send();
  },
};
