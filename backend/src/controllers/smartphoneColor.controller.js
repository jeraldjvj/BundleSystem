import { smartphoneColorRepository } from '../repositories/smartphoneColor.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const smartphoneColorController = {
  async getAll(_req, res) {
    res.json(await smartphoneColorRepository.findAll());
  },

  async getById(req, res) {
    const smartphoneColor = await smartphoneColorRepository.findById(req.params.smartphone_color_id);
    if (!smartphoneColor) throw new HttpError(404, 'Smartphone color not found');
    res.json(smartphoneColor);
  },

  async create(req, res) {
    const smartphoneColor = await smartphoneColorRepository.create(req.body);
    res.status(201).json(smartphoneColor);
  },

  async update(req, res) {
    const smartphoneColor = await smartphoneColorRepository.update(req.params.smartphone_color_id, req.body);
    if (!smartphoneColor) throw new HttpError(404, 'Smartphone color not found');
    res.json(smartphoneColor);
  },

  async remove(req, res) {
    const deleted = await smartphoneColorRepository.remove(req.params.smartphone_color_id);
    if (!deleted) throw new HttpError(404, 'Smartphone color not found');
    res.status(204).send();
  },
};
