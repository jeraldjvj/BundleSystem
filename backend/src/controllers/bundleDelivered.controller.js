import { bundleDeliveredRepository } from '../repositories/bundleDelivered.repository.js';
import { bundleRepository } from '../repositories/bundle.repository.js';
import { projectRepository } from '../repositories/project.repository.js';
import { storeRepository } from '../repositories/store.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const bundleDeliveredController = {
  async getAll(req, res) {
    res.json(await bundleDeliveredRepository.findAll({ userId: req.user.userId, levelUser: req.user.levelUser }));
  },

  async getById(req, res) {
    const bundleDelivered = await bundleDeliveredRepository.findById(req.params.bundle_delivered_id);
    if (!bundleDelivered) throw new HttpError(404, 'Bundle delivered not found');
    if (!(await bundleDeliveredRepository.canView(bundleDelivered, req.user))) {
      throw new HttpError(403, 'No tienes permiso para ver esta entrega');
    }
    res.json(bundleDelivered);
  },

  async create(req, res) {
    const bundle = await bundleRepository.findById(req.body.bundle_id);
    if (!bundle) throw new HttpError(404, 'Bandeo no encontrado');
    // Solo se puede entregar un bandeo asignado al propio usuario,
    // y la entrega queda registrada a nombre de quien tiene la sesión
    if (Number(bundle.userId) !== Number(req.user.userId)) {
      throw new HttpError(403, 'Solo puedes entregar bandeos asignados a tu usuario');
    }
    if (bundle.status !== 'available') {
      throw new HttpError(409, 'Este bandeo ya fue entregado');
    }
    // La tienda registrada debe existir y estar asignada al usuario que entrega
    const store = await storeRepository.findById(req.body.store_code);
    if (!store) throw new HttpError(404, 'Tienda no encontrada');
    if (Number(store.userId) !== Number(req.user.userId)) {
      throw new HttpError(403, 'La tienda no está asignada a tu usuario');
    }
    const project = await projectRepository.findById(bundle.projectId);
    if (project && project.status !== 'active') {
      throw new HttpError(409, 'No se puede entregar un bandeo de un proyecto completado');
    }
    const bundleDelivered = await bundleDeliveredRepository.create({ ...req.body, user_id: req.user.userId });
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
