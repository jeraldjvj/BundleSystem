import { bundleDeliveredRepository } from '../repositories/bundleDelivered.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const bundleDeliveredController = {
  async getAll(_req, res) {
    res.json(await bundleDeliveredRepository.findAll());
  },

  async getById(req, res) {
    const bundleDelivered = await bundleDeliveredRepository.findById(req.params.bundle_delivered_id);
    if (!bundleDelivered) throw new HttpError(404, 'Bundle delivered not found');
    res.json(bundleDelivered);
  },

  async create(req, res) {
    const bundleDelivered = await bundleDeliveredRepository.create(req.body);
    res.status(201).json(bundleDelivered);
  },

  async update(req, res) {
    const bundleDelivered = await bundleDeliveredRepository.update(req.params.bundle_delivered_id, req.body);
    if (!bundleDelivered) throw new HttpError(404, 'Bundle delivered not found');
    res.json(bundleDelivered);
  },

  async remove(req, res) {
    const deleted = await bundleDeliveredRepository.remove(req.params.bundle_delivered_id);
    if (!deleted) throw new HttpError(404, 'Bundle delivered not found');
    res.status(204).send();
  },
};
