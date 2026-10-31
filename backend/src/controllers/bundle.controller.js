import { bundleRepository } from '../repositories/bundle.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const bundleController = {
  async getAll(_req, res) {
    res.json(await bundleRepository.findAll());
  },

  async getById(req, res) {
    const bundle = await bundleRepository.findById(req.params.bundle_id);
    if (!bundle) throw new HttpError(404, 'Bundle not found');
    res.json(bundle);
  },

  async verifySerial(req, res) {
    const { serial, userId } = req.params;
    const bundle = await bundleRepository.findBySerial(serial);
    if (!bundle) throw new HttpError(404, 'Serial number not found');
    if (Number(bundle.userId) !== Number(userId)) {
      throw new HttpError(403, 'Este bundle no está asignado a tu usuario');
    }
    res.json(bundle);
  },

  async create(req, res) {
    const bundle = await bundleRepository.create(req.body);
    res.status(201).json(bundle);
  },

  async update(req, res) {
    const bundle = await bundleRepository.update(req.params.bundle_id, req.body);
    if (!bundle) throw new HttpError(404, 'Bundle not found');
    res.json(bundle);
  },

  async assign(req, res) {
    const bundle = await bundleRepository.assign(req.params.bundle_id, req.body.new_user_id, req.headers['x-user-id']);
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
      req.headers['x-user-id']
    );
    if (result.error) throw new HttpError(400, result.error);
    res.status(201).json({ message: 'Transferencia solicitada', ...result });
  },

  async pendingTransfers(req, res) {
    res.json(await bundleRepository.findPendingTransfersFor(req.params.user_id));
  },

  async outgoingTransfers(req, res) {
    res.json(await bundleRepository.findOutgoingPendingTransfers(req.params.user_id));
  },

  async cancelTransfer(req, res) {
    const result = await bundleRepository.cancelTransfer(
      req.params.transfer_history_id,
      req.headers['x-user-id']
    );
    if (result.error) throw new HttpError(400, result.error);
    res.json({ message: 'Transferencia cancelada' });
  },

  async resolveTransfer(req, res) {
    const approve = req.path.endsWith('/approve');
    const result = await bundleRepository.resolveTransfer(
      req.params.transfer_history_id,
      req.headers['x-user-id'],
      approve
    );
    if (result.error) throw new HttpError(400, result.error);
    res.json({ message: approve ? 'Transferencia aprobada' : 'Transferencia rechazada' });
  },
};
