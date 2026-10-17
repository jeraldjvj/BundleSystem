import { distributorRepository } from '../repositories/distributor.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const distributorController = {
  async getAll(_req, res) {
    res.json(await distributorRepository.findAll());
  },

  async getById(req, res) {
    const distributor = await distributorRepository.findById(req.params.distributor_id);
    if (!distributor) throw new HttpError(404, 'Distributor not found');
    res.json(distributor);
  },

  async create(req, res) {
    const distributor = await distributorRepository.create(req.body);
    res.status(201).json(distributor);
  },

  async update(req, res) {
    const distributor = await distributorRepository.update(req.params.distributor_id, req.body);
    if (!distributor) throw new HttpError(404, 'Distributor not found');
    res.json(distributor);
  },

  async remove(req, res) {
    const deleted = await distributorRepository.remove(req.params.distributor_id);
    if (!deleted) throw new HttpError(404, 'Distributor not found');
    res.status(204).send();
  },
};
