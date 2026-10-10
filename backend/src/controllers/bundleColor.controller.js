import { bundleColorRepository } from '../repositories/bundleColor.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const bundleColorController = {
  async getAll(_req, res) {
    res.json(await bundleColorRepository.findAll());
  },

  async getById(req, res) {
    const bundleColor = await bundleColorRepository.findById(req.params.bundle_color_id);
    if (!bundleColor) throw new HttpError(404, 'Bundle color not found');
    res.json(bundleColor);
  },

  async create(req, res) {
    const bundleColor = await bundleColorRepository.create(req.body);
    res.status(201).json(bundleColor);
  },

  async update(req, res) {
    const bundleColor = await bundleColorRepository.update(req.params.bundle_color_id, req.body);
    if (!bundleColor) throw new HttpError(404, 'Bundle color not found');
    res.json(bundleColor);
  },

  async remove(req, res) {
    const deleted = await bundleColorRepository.remove(req.params.bundle_color_id);
    if (!deleted) throw new HttpError(404, 'Bundle color not found');
    res.status(204).send();
  },
};
