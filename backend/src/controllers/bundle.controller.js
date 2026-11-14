import { bundleRepository } from '../repositories/bundle.repository.js';
import { projectRepository } from '../repositories/project.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const bundleController = {
  async getAll(req, res) {
    res.json(await bundleRepository.findAll({ userId: req.user.userId, levelUser: req.user.levelUser }));
  },

  async getById(req, res) {
    const bundle = await bundleRepository.findById(req.params.bundle_id);
    if (!bundle) throw new HttpError(404, 'Bundle not found');
    if (!(await bundleRepository.canView(bundle, req.user))) {
      throw new HttpError(403, 'No tienes permiso para ver este bandeo');
    }
    res.json(bundle);
  },

  async verifySerial(req, res) {
    const { serial } = req.params;
    const bundle = await bundleRepository.findBySerial(serial);
    if (!bundle) throw new HttpError(404, 'Serial number not found');
    if (Number(bundle.userId) !== Number(req.user.userId)) {
      throw new HttpError(403, 'Este bundle no está asignado a tu usuario');
    }
    res.json(bundle);
  },

  async create(req, res) {
    const project = await projectRepository.findById(req.body.project_id);
    if (!project) throw new HttpError(404, 'Proyecto no encontrado');
    if (project.status !== 'active') {
      throw new HttpError(409, 'No se pueden agregar bandeos a un proyecto completado');
    }
    const bundle = await bundleRepository.create(req.body);
    res.status(201).json(bundle);
  },

  async update(req, res) {
    const bundle = await bundleRepository.update(req.params.bundle_id, req.body);
    if (!bundle) throw new HttpError(404, 'Bundle not found');
    res.json(bundle);
  },

  async assign(req, res) {
    const current = await bundleRepository.findById(req.params.bundle_id);
    if (!current) throw new HttpError(404, 'Bundle not found');
    // No tiene sentido reasignar un bandeo ya entregado a un cliente
    if (current.status !== 'available') {
      throw new HttpError(409, 'Solo se pueden asignar bandeos disponibles');
    }
    // El destino debe existir y estar activo (además del FK de la BD)
    const target = await userRepository.findById(req.body.new_user_id);
    if (!target) throw new HttpError(404, 'Usuario destino no encontrado');
    if (String(target.status).toLowerCase() !== 'active') {
      throw new HttpError(400, 'El usuario destino está inactivo');
    }
    // Solo Office Manager / City Manager pueden asignar bandeos ajenos;
    // cualquier otro usuario solo puede asignar los suyos
    const level = req.user.levelUser;
    if (level !== 'Office Manager' && level !== 'admin') {
      if (!(await bundleRepository.canView(current, req.user))) {
        throw new HttpError(403, 'Solo puedes asignar los bandeos de tu inventario o de tu equipo');
      }
    }
    const bundle = await bundleRepository.assign(req.params.bundle_id, req.body.new_user_id, req.user.userId);
    if (!bundle) throw new HttpError(404, 'Bundle not found');
    res.json(bundle);
  },

  async remove(req, res) {
    const deleted = await bundleRepository.remove(req.params.bundle_id);
    if (!deleted) throw new HttpError(404, 'Bundle not found');
    res.status(204).send();
  },

  async requestTransfer(req, res) {
    const result = await bundleRepository.requestTransfer(
      req.params.bundle_id,
      req.body.new_user_id,
      req.user.userId
    );
    if (result.error) throw new HttpError(400, result.error);
    res.status(201).json({ message: 'Transferencia solicitada', ...result });
  },

  async pendingTransfers(req, res) {
    res.json(await bundleRepository.findPendingTransfersFor(req.user.userId));
  },

  async outgoingTransfers(req, res) {
    res.json(await bundleRepository.findOutgoingPendingTransfers(req.user.userId));
  },

  async transferHistory(req, res) {
    res.json(await bundleRepository.findTransferHistory(req.user.userId));
  },

  async allTransferHistory(req, res) {
    if (req.user.levelUser !== 'Office Manager') {
      throw new HttpError(403, 'Solo Office Manager puede ver el histórico completo de transferencias');
    }
    res.json(await bundleRepository.findAllTransferHistory());
  },

  async cancelTransfer(req, res) {
    const result = await bundleRepository.cancelTransfer(
      req.params.transfer_history_id,
      req.user.userId
    );
    if (result.error) throw new HttpError(400, result.error);
    res.json({ message: 'Transferencia cancelada' });
  },

  async resolveTransfer(req, res) {
    const approve = req.path.endsWith('/approve');
    const result = await bundleRepository.resolveTransfer(
      req.params.transfer_history_id,
      req.user.userId,
      approve
    );
    if (result.error) throw new HttpError(400, result.error);
    res.json({ message: approve ? 'Transferencia aprobada' : 'Transferencia rechazada' });
  },
};
