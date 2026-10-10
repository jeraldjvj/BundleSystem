import { smartphoneRepository } from '../repositories/smartphone.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const smartphoneController = {
  async getAll(_req, res) {
    res.json(await smartphoneRepository.findAll());
  },

  async getById(req, res) {
    const smartphone = await smartphoneRepository.findById(req.params.smartphones_id);
    if (!smartphone) throw new HttpError(404, 'Smartphone not found');
    res.json(smartphone);
  },

  async create(req, res) {
    const smartphone = await smartphoneRepository.create(req.body);
    res.status(201).json(smartphone);
  },

  async update(req, res) {
    const smartphone = await smartphoneRepository.update(req.params.smartphones_id, req.body);
    if (!smartphone) throw new HttpError(404, 'Smartphone not found');
    res.json(smartphone);
  },

  async remove(req, res) {
    const deleted = await smartphoneRepository.remove(req.params.smartphones_id);
    if (!deleted) throw new HttpError(404, 'Smartphone not found');
    res.status(204).send();
  },
};
