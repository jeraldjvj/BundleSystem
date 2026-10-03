-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema bundle_system
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema bundle_system
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bundle_system` DEFAULT CHARACTER SET utf8mb3 ;
USE `bundle_system` ;

-- -----------------------------------------------------
-- Table `bundle_system`.`bundle_color`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`bundle_color` (
  `bundle_color_id` INT NOT NULL AUTO_INCREMENT,
  `color_name_eng` VARCHAR(45) NOT NULL,
  `color_name_spa` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`bundle_color_id`),
  UNIQUE INDEX `bundle_color_id_UNIQUE` (`bundle_color_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`bundle_model`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`bundle_model` (
  `bundle_model_id` INT NOT NULL AUTO_INCREMENT,
  `bundle_name` VARCHAR(45) NOT NULL,
  `bundle_color_id` INT NOT NULL,
  PRIMARY KEY (`bundle_model_id`, `bundle_color_id`),
  UNIQUE INDEX `bundle_model_id_UNIQUE` (`bundle_model_id` ASC) VISIBLE,
  INDEX `fk_bundle_model_bundle_color1_idx` (`bundle_color_id` ASC) VISIBLE,
  CONSTRAINT `fk_bundle_model_bundle_color1`
    FOREIGN KEY (`bundle_color_id`)
    REFERENCES `bundle_system`.`bundle_color` (`bundle_color_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`project`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`project` (
  `project_id` INT NOT NULL AUTO_INCREMENT,
  `project_name` VARCHAR(60) NOT NULL,
  `start_date` DATE NOT NULL,
  `status` VARCHAR(50) NULL DEFAULT 'active',
  `create_time` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`project_id`),
  UNIQUE INDEX `project_id_UNIQUE` (`project_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`user` (
  `user_id` BIGINT NOT NULL AUTO_INCREMENT,
  `mi_id` VARCHAR(10) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `level_user` VARCHAR(45) NOT NULL DEFAULT 'field force',
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `password_hash_UNIQUE` (`password_hash` ASC) VISIBLE,
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `mi_id_UNIQUE` (`mi_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`bundle`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`bundle` (
  `bundle_id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `serial_number` VARCHAR(50) NOT NULL,
  `bundle_model_id` INT NOT NULL,
  `bundle_color_id` INT NOT NULL,
  `create_time` TIMESTAMP NOT NULL,
  PRIMARY KEY (`bundle_id`, `project_id`, `user_id`, `bundle_model_id`, `bundle_color_id`),
  UNIQUE INDEX `serial_number_UNIQUE` (`serial_number` ASC) VISIBLE,
  UNIQUE INDEX `bundle_id_UNIQUE` (`bundle_id` ASC) VISIBLE,
  INDEX `fk_bundle_inventory_bundle1_idx` (`bundle_model_id` ASC, `bundle_color_id` ASC) VISIBLE,
  INDEX `fk_bundle_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_bundle_project1_idx` (`project_id` ASC) VISIBLE,
  CONSTRAINT `fk_bundle_inventory_bundle1`
    FOREIGN KEY (`bundle_model_id` , `bundle_color_id`)
    REFERENCES `bundle_system`.`bundle_model` (`bundle_model_id` , `bundle_color_id`),
  CONSTRAINT `fk_bundle_project1`
    FOREIGN KEY (`project_id`)
    REFERENCES `bundle_system`.`project` (`project_id`),
  CONSTRAINT `fk_bundle_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `bundle_system`.`user` (`user_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`smartphone_color`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`smartphone_color` (
  `smartphone_color_id` INT NOT NULL AUTO_INCREMENT,
  `color_name_eng` VARCHAR(45) NOT NULL,
  `color_name_spa` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`smartphone_color_id`),
  UNIQUE INDEX `smartphone_color_id_UNIQUE` (`smartphone_color_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`smartphone_model`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`smartphone_model` (
  `smartphone_model_id` INT NOT NULL AUTO_INCREMENT,
  `smartphone_color_id` INT NOT NULL,
  `model_code` VARCHAR(45) NOT NULL,
  `model_name` VARCHAR(50) NOT NULL,
  `ram` VARCHAR(5) NOT NULL,
  `rom` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`smartphone_model_id`, `smartphone_color_id`),
  UNIQUE INDEX `model_code_UNIQUE` (`model_code` ASC) VISIBLE,
  UNIQUE INDEX `smartphone_model_id_UNIQUE` (`smartphone_model_id` ASC) VISIBLE,
  INDEX `fk_smartphone_model_smartphone_color1_idx` (`smartphone_color_id` ASC) VISIBLE,
  CONSTRAINT `fk_smartphone_model_smartphone_color1`
    FOREIGN KEY (`smartphone_color_id`)
    REFERENCES `bundle_system`.`smartphone_color` (`smartphone_color_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`smartphones_database`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`smartphones_database` (
  `smartphones_id` INT NOT NULL,
  `smartphone_model_id` INT NOT NULL,
  `tag_model` VARCHAR(45) NOT NULL,
  `imei_1` VARCHAR(45) NOT NULL,
  `distributor` VARCHAR(45) NOT NULL,
  `status` VARCHAR(45) NOT NULL DEFAULT 'available',
  PRIMARY KEY (`smartphones_id`, `smartphone_model_id`),
  UNIQUE INDEX `smartphones_id_UNIQUE` (`smartphones_id` ASC) VISIBLE,
  UNIQUE INDEX `imei_1_UNIQUE` (`imei_1` ASC) VISIBLE,
  INDEX `fk_smartphones_database_smartphone_model1_idx` (`smartphone_model_id` ASC) VISIBLE,
  CONSTRAINT `fk_smartphones_database_smartphone_model1`
    FOREIGN KEY (`smartphone_model_id`)
    REFERENCES `bundle_system`.`smartphone_model` (`smartphone_model_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`bundle_delivered`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`bundle_delivered` (
  `bundle_delivered_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `bundle_id` INT NOT NULL,
  `smartphones_id` INT NOT NULL,
  `client_full_name` VARCHAR(120) NOT NULL,
  `client_phone` VARCHAR(45) NOT NULL,
  `client_picture` VARCHAR(255) NOT NULL,
  `create_time` TIMESTAMP NOT NULL,
  `store_code` VARCHAR(45) NOT NULL,
  `store_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`bundle_delivered_id`, `user_id`, `bundle_id`, `smartphones_id`),
  UNIQUE INDEX `bundle_delivered_id_UNIQUE` (`bundle_delivered_id` ASC) VISIBLE,
  INDEX `fk_project_content_bundle1_idx` (`bundle_id` ASC) VISIBLE,
  INDEX `fk_bundle_delivered_smartphones_database1_idx` (`smartphones_id` ASC) VISIBLE,
  INDEX `fk_bundle_delivered_user1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_bundle_delivered_smartphones_database1`
    FOREIGN KEY (`smartphones_id`)
    REFERENCES `bundle_system`.`smartphones_database` (`smartphones_id`),
  CONSTRAINT `fk_bundle_delivered_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `bundle_system`.`user` (`user_id`),
  CONSTRAINT `fk_project_content_bundle1`
    FOREIGN KEY (`bundle_id`)
    REFERENCES `bundle_system`.`bundle` (`bundle_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`stores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`stores` (
  `store_code` VARCHAR(45) NOT NULL,
  `user_id` BIGINT NOT NULL,
  `rms_store_code` VARCHAR(45) NOT NULL,
  `store_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`store_code`, `user_id`),
  UNIQUE INDEX `store_code_UNIQUE` (`store_code` ASC) VISIBLE,
  INDEX `fk_stores_user1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_stores_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `bundle_system`.`user` (`user_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bundle_system`.`user_profile`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bundle_system`.`user_profile` (
  `profile_id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(60) NOT NULL,
  `role_title` VARCHAR(45) NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `profile_picture` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`profile_id`, `user_id`),
  UNIQUE INDEX `profile_id_UNIQUE` (`profile_id` ASC) VISIBLE,
  INDEX `fk_user_profile_user_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_profile_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `bundle_system`.`user` (`user_id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

