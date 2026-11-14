-- Revocación de sesiones: al cambiar la contraseña se incrementa token_version
-- y todos los JWT emitidos antes quedan inválidos
ALTER TABLE user
  ADD COLUMN token_version INT NOT NULL DEFAULT 0 AFTER must_change_password;
