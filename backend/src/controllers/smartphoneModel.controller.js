import { smartphoneModelRepository } from '../repositories/smartphoneModel.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const smartphoneModelController = {
  async getAll(_req, res) {
    res.json(await smartphoneModelRepository.findAll());
  },

  async getById(req, res) {
    const smartphoneModel = await smartphoneModelRepository.findById(req.params.smartphone_model_id);
    if (!smartphoneModel) throw new HttpError(404, 'Smartphone model not found');
    res.json(smartphoneModel);
  },

  async create(req, res) {
    const smartphoneModel = await smartphoneModelRepository.create(req.body);
    res.status(201).json(smartphoneModel);
  },

  async update(req, res) {
    const smartphoneModel = await smartphoneModelRepository.update(req.params.smartphone_model_id, req.body);
    if (!smartphoneModel) throw new HttpError(404, 'Smartphone model not found');
    res.json(smartphoneModel);
  },

  async remove(req, res) {
    const deleted = await smartphoneModelRepository.remove(req.params.smartphone_model_id);
    if (!deleted) throw new HttpError(404, 'Smartphone model not found');
    res.status(204).send();
  },
};
