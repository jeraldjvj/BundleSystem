-- Agrega el campo de Carnet de Identidad (CI) del cliente en las entregas
ALTER TABLE bundle_delivered
  ADD COLUMN client_ci VARCHAR(20) NULL AFTER client_full_name;
