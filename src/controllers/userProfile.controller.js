import { userProfileRepository } from '../repositories/userProfile.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const userProfileController = {
  async getAll(_req, res) {
    res.json(await userProfileRepository.findAll());
  },

  async getById(req, res) {
    const userProfile = await userProfileRepository.findById(req.params.profile_id);
    if (!userProfile) throw new HttpError(404, 'User profile not found');
    res.json(userProfile);
  },

  async create(req, res) {
    const userProfile = await userProfileRepository.create(req.body);
    res.status(201).json(userProfile);
  },

  async update(req, res) {
    const userProfile = await userProfileRepository.update(req.params.profile_id, req.body);
    if (!userProfile) throw new HttpError(404, 'User profile not found');
    res.json(userProfile);
  },

  async remove(req, res) {
    const deleted = await userProfileRepository.remove(req.params.profile_id);
    if (!deleted) throw new HttpError(404, 'User profile not found');
    res.status(204).send();
  },
};
