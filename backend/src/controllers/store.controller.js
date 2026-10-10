import { storeRepository } from '../repositories/store.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const storeController = {
  async getAll(_req, res) {
    res.json(await storeRepository.findAll());
  },

  async getById(req, res) {
    const store = await storeRepository.findById(req.params.store_code);
    if (!store) throw new HttpError(404, 'Store not found');
    res.json(store);
  },

  async create(req, res) {
    const store = await storeRepository.create(req.body);
    res.status(201).json(store);
  },

  async update(req, res) {
    const store = await storeRepository.update(req.params.store_code, req.body);
    if (!store) throw new HttpError(404, 'Store not found');
    res.json(store);
  },

  async remove(req, res) {
    const deleted = await storeRepository.remove(req.params.store_code);
    if (!deleted) throw new HttpError(404, 'Store not found');
    res.status(204).send();
  },
};
