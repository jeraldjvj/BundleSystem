import { Router } from 'express';
import { reportRepository } from '../repositories/report.repository.js';
import { pool } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/summary', asyncHandler(async (req, res) => {
  // El scope sale del JWT verificado — el cliente no puede pedir datos de otro usuario
  const userId = req.user.userId;
  const levelUser = req.user.levelUser;
  const level = String(levelUser || '').toLowerCase();
  let scope = null; // null = sin filtro (Office Manager / admin)

  if (level === 'city manager') {
    // El propio usuario + los que lo tienen como head_in_charge
    const [subs] = await pool.query(
      `SELECT up.user_id FROM user_profile up
       WHERE up.head_in_charge = (
         SELECT CONCAT(up2.first_name, ' ', up2.last_name)
         FROM user_profile up2 WHERE up2.user_id = ?
       )`,
      [userId]
    );
    scope = { userIds: [Number(userId), ...subs.map(r => r.user_id)] };
  } else if (level !== 'office manager' && level !== 'admin') {
    // Field Force u otro: solo lo propio
    scope = { userIds: [Number(userId)] };
  }

  const projectId = Number(req.query.projectId) || null;
  const projectStatus = ['active', 'completed'].includes(req.query.projectStatus) ? req.query.projectStatus : null;
  res.json(await reportRepository.summary(scope, projectId, projectStatus));
}));

export default router;
