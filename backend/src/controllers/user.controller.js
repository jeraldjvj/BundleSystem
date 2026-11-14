import { userRepository } from '../repositories/user.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const userController = {
  async getAll(req, res) {
    const users = await userRepository.findAll();
    // City Manager solo necesita identificar destinos de asignación;
    // no recibe email, fecha de nacimiento ni otros datos personales
    if (req.user.levelUser !== 'Office Manager' && req.user.levelUser !== 'admin') {
      return res.json(users.map(u => ({
        userId: u.userId,
        miId: u.miId,
        firstName: u.firstName,
        lastName: u.lastName,
        levelUser: u.levelUser,
        status: u.status,
      })));
    }
    res.json(users);
  },

  async getById(req, res) {
    // Sin privilegios solo se puede consultar el propio perfil
    const level = req.user.levelUser;
    if (level !== 'Office Manager' && level !== 'City Manager' && String(req.params.user_id) !== String(req.user.userId)) {
      throw new HttpError(403, 'Solo puedes consultar tu propio perfil');
    }
    const user = await userRepository.findById(req.params.user_id);
    if (!user) throw new HttpError(404, 'User not found');
    // City Manager consultando perfiles ajenos: solo lo necesario para asignar;
    // sin email, fecha de nacimiento ni otros datos personales
    if (req.user.levelUser === 'City Manager' && String(req.params.user_id) !== String(req.user.userId)) {
      return res.json({
        userId: user.userId,
        miId: user.miId,
        firstName: user.firstName,
        lastName: user.lastName,
        levelUser: user.levelUser,
        status: user.status,
      });
    }
    res.json(user);
  },

  async getByMiId(req, res) {
    const user = await userRepository.findByMiId(req.params.mi_id);
    if (!user) throw new HttpError(404, 'Usuario no encontrado con ese MI ID');
    if (String(user.status).toLowerCase() !== 'active') throw new HttpError(403, 'El usuario está inactivo');
    // Respuesta mínima para validar el destino de una transferencia;
    // no exponer email, fecha de nacimiento ni otros datos personales
    res.json({
      userId: user.userId,
      miId: user.miId,
      firstName: user.firstName,
      lastName: user.lastName,
      levelUser: user.levelUser,
      status: user.status,
    });
  },

  async create(req, res) {
    const user = await userRepository.create(req.body);
    res.status(201).json(user);
  },

  async update(req, res) {
    // No dejar el sistema sin Office Manager activo:
    // bloquear degradar/desactivar al último OM
    const demotesOm = (data) =>
      (data.level_user !== undefined && data.level_user !== 'Office Manager') ||
      (data.status !== undefined && String(data.status).toLowerCase() !== 'active');
    const target = await userRepository.findById(req.params.user_id);
    if (!target) throw new HttpError(404, 'User not found');
    if (target.levelUser === 'Office Manager' && demotesOm(req.body)) {
      if (await userRepository.countActiveOfficeManagers() <= 1) {
        throw new HttpError(409, 'No puedes quitar el rol o desactivar al último Office Manager activo');
      }
    }
    const user = await userRepository.update(req.params.user_id, req.body);
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  },

  async remove(req, res) {
    const target = await userRepository.findById(req.params.user_id);
    if (!target) throw new HttpError(404, 'User not found');
    if (target.levelUser === 'Office Manager' &&
        (await userRepository.countActiveOfficeManagers()) <= 1) {
      throw new HttpError(409, 'No puedes eliminar al último Office Manager activo');
    }
    const deleted = await userRepository.remove(req.params.user_id);
    if (!deleted) throw new HttpError(404, 'User not found');
    res.status(204).send();
  },
};
