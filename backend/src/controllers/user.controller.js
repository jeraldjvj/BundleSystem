import { userRepository } from '../repositories/user.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const userController = {
  async getAll(_req, res) {
    res.json(await userRepository.findAll());
  },

  async getById(req, res) {
    const user = await userRepository.findById(req.params.user_id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  },

  async create(req, res) {
    const user = await userRepository.create(req.body);
    res.status(201).json(user);
  },

  async update(req, res) {
    const user = await userRepository.update(req.params.user_id, req.body);
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  },

  async remove(req, res) {
    const deleted = await userRepository.remove(req.params.user_id);
    if (!deleted) throw new HttpError(404, 'User not found');
    res.status(204).send();
  },
};
