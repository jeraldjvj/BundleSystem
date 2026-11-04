import { pool } from '../config/database.js';

// scope: null = todos los datos | { userIds: [...] } = solo esos usuarios
export const reportRepository = {
  async summary(scope = null, projectId = null, projectStatus = null) {
    const params = [
      ...(scope ? [scope.userIds] : []),
      ...(projectId ? [projectId] : projectStatus ? [projectStatus] : []),
    ];

    // Filtro por proyecto: individual o por estado del proyecto (active/completed)
    const projectCond = projectId
      ? 'b.project_id = ?'
      : projectStatus
        ? 'b.project_id IN (SELECT project_id FROM project WHERE status = ?)'
        : null;

    // Filtros componibles: scope de usuario + proyecto seleccionado
    const bundleCond = [
      scope && 'b.user_id IN (?)',
      projectCond,
    ].filter(Boolean);
    const bundleWhere = bundleCond.length ? `WHERE ${bundleCond.join(' AND ')}` : '';
    const bundleAvailableWhere = bundleWhere
      ? `${bundleWhere} AND b.status = 'available'`
      : "WHERE b.status = 'available'";

    // Las entregas se filtran por proyecto a través del bandeo entregado
    const delivJoin = projectCond ? 'JOIN bundle b ON bd.bundle_id = b.bundle_id' : '';
    const delivCond = [
      scope && 'bd.user_id IN (?)',
      projectCond,
    ].filter(Boolean);
    const deliveryWhere = delivCond.length ? `WHERE ${delivCond.join(' AND ')}` : '';
    const storeWhere = scope ? 'WHERE user_id IN (?)' : '';

    const [bundlesByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM bundle b ${bundleWhere} GROUP BY status`,
      params
    );

    const [bundlesAvailableByUser] = await pool.query(`
      SELECT CONCAT(up.first_name, ' ', up.last_name) AS name, COUNT(*) AS count
      FROM bundle b
      JOIN user u ON b.user_id = u.user_id
      LEFT JOIN user_profile up ON u.user_id = up.user_id
      ${bundleAvailableWhere}
      GROUP BY b.user_id, up.first_name, up.last_name
      ORDER BY count DESC
    `, params);

    // smartphones_database no tiene user_id: es inventario global
    const [smartphonesByStatus] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM smartphones_database GROUP BY status'
    );

    const [deliveriesByStore] = await pool.query(
      `SELECT store_name, COUNT(*) AS count FROM bundle_delivered bd ${delivJoin} ${deliveryWhere} GROUP BY store_name ORDER BY count DESC`,
      params
    );

    const [deliveriesByUser] = await pool.query(`
      SELECT CONCAT(up.first_name, ' ', up.last_name) AS name, COUNT(*) AS count
      FROM bundle_delivered bd
      ${delivJoin}
      JOIN user u ON bd.user_id = u.user_id
      LEFT JOIN user_profile up ON u.user_id = up.user_id
      ${deliveryWhere}
      GROUP BY bd.user_id, up.first_name, up.last_name
      ORDER BY count DESC
    `, params);

    const [deliveriesByDay] = await pool.query(`
      SELECT DATE(bd.create_time) AS day, COUNT(*) AS count
      FROM bundle_delivered bd
      ${delivJoin}
      ${deliveryWhere}
      GROUP BY DATE(bd.create_time)
      ORDER BY day
    `, params);

    const [bundlesByProject] = await pool.query(`
      SELECT p.project_name AS name, COUNT(*) AS count
      FROM bundle b
      LEFT JOIN project p ON b.project_id = p.project_id
      ${bundleWhere}
      GROUP BY b.project_id, p.project_name
      ORDER BY count DESC
    `, params);

    const [usersByLevel] = await pool.query(`
      SELECT u.level_user AS name, COUNT(*) AS count
      FROM user u
      ${scope ? 'WHERE u.user_id IN (?)' : ''}
      GROUP BY u.level_user
      ORDER BY count DESC
    `, scope ? [scope.userIds] : []);

    const [deliveriesByCity] = await pool.query(`
      SELECT s.city AS name, COUNT(*) AS count
      FROM bundle_delivered bd
      ${delivJoin}
      LEFT JOIN stores s ON bd.store_code = s.store_code
      ${deliveryWhere}
      GROUP BY s.city
      ORDER BY count DESC
    `, params);

    const [deliveriesList] = await pool.query(`
      SELECT bd.bundle_delivered_id, bd.user_id, bd.client_full_name, bd.client_phone,
        bd.client_picture, bd.create_time, bd.store_code, bd.store_name,
        b.serial_number, bm.bundle_name,
        sp.imei_1, sm.model_name, st.city,
        CONCAT(up.first_name, ' ', up.last_name) AS delivered_by
      FROM bundle_delivered bd
      LEFT JOIN bundle b ON bd.bundle_id = b.bundle_id
      LEFT JOIN bundle_model bm ON b.bundle_model_id = bm.bundle_model_id
      LEFT JOIN smartphones_database sp ON bd.smartphones_id = sp.smartphones_id
      LEFT JOIN smartphone_model sm ON sp.smartphone_model_id = sm.smartphone_model_id
      LEFT JOIN user u ON bd.user_id = u.user_id
      LEFT JOIN user_profile up ON u.user_id = up.user_id
      LEFT JOIN stores st ON bd.store_code = st.store_code
      ${deliveryWhere}
      ORDER BY bd.create_time DESC
    `, params);

    const totalsParams = [
      ...params, // bundles
      ...params, // bundlesAvailable
      ...params, // deliveries
      ...params, // storesDelivered (tiendas donde se entregó)
      ...(scope ? [scope.userIds] : []), // stores (solo scope)
    ];
    const [[totals]] = await pool.query(`SELECT
      (SELECT COUNT(*) FROM bundle b ${bundleWhere}) AS bundles,
      (SELECT COUNT(*) FROM bundle b ${bundleAvailableWhere}) AS bundlesAvailable,
      (SELECT COUNT(*) FROM smartphones_database) AS smartphones,
      (SELECT COUNT(*) FROM bundle_delivered bd ${delivJoin} ${deliveryWhere}) AS deliveries,
      (SELECT COUNT(DISTINCT bd.store_code) FROM bundle_delivered bd ${delivJoin} ${deliveryWhere}) AS storesDelivered,
      (SELECT COUNT(*) FROM stores ${storeWhere}) AS stores,
      (SELECT COUNT(*) FROM user) AS users,
      (SELECT COUNT(*) FROM project) AS projects
    `, totalsParams);

    return {
      totals,
      bundlesByStatus,
      bundlesAvailableByUser,
      smartphonesByStatus,
      deliveriesByStore,
      deliveriesByUser,
      deliveriesByDay,
      deliveriesByCity,
      usersByLevel,
      bundlesByProject,
      deliveriesList,
    };
  },
};
