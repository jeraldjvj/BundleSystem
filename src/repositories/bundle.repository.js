import { randomUUID } from 'node:crypto';

// In-memory storage; replace with your database client (Prisma, Mongoose, pg, etc.)
const bundles = new Map();

export const bundleRepository = {
  async findAll() {
    return [...bundles.values()];
  },

  async findById(id) {
    return bundles.get(id) ?? null;
  },

  async create(data) {
    const now = new Date().toISOString();
    const bundle = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
    bundles.set(bundle.id, bundle);
    return bundle;
  },

  async update(id, data) {
    const current = bundles.get(id);
    if (!current) return null;
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    bundles.set(id, updated);
    return updated;
  },

  async remove(id) {
    return bundles.delete(id);
  },
};
