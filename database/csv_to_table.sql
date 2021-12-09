/*
TO RUN THIS SCRIPT
	-Download MySQL.
	-Enter cmd prompt and add MySQL path to PATH 
		(e.g. for Windows: "set PATH=%PATH%;C:\Program Files\MySQL\MySQL Server 8.0\bin")
	-Enable local_infile globally in mysql and then close mysql
		(SET GLOBAL local_infile=1)
	-cd to this script's directory and run MySQL client with --local_infile flag enabled
		("mysql --local_infile=1 -u root -p")
	-Run the script
		("SOURCE csv_to_table.sql;")
*/


CREATE DATABASE covid_data;

USE covid_data;

CREATE TABLE `covid_data`.`cali_historical_facility_counts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `facility_id` INT NOT NULL DEFAULT 0,
  `jurisdiction` VARCHAR(45) NOT NULL DEFAULT '0',
  `state` VARCHAR(45) NOT NULL DEFAULT '0',
  `name` VARCHAR(45) NOT NULL DEFAULT '0',
  `date` DATETIME NULL,
  `source` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents_confirmed` INT NOT NULL DEFAULT 0,
  `staff_confirmed` INT NOT NULL DEFAULT 0,
  `residents_deaths` INT NOT NULL DEFAULT 0,
  `staff_deaths` INT NOT NULL DEFAULT 0,
  `residents_tadmin` INT NOT NULL DEFAULT 0,
  `residents_tested` INT NOT NULL DEFAULT 0,
  `residents_active` INT NOT NULL DEFAULT 0,
  `staff_active` INT NOT NULL DEFAULT 0,
  `population_feb20` INT NOT NULL DEFAULT 0,
  `residents_population` INT NOT NULL DEFAULT 0,
  `residents_initiated` INT NOT NULL DEFAULT 0,
  `staff_initiated` INT NOT NULL DEFAULT 0,
  `residents_completed` INT NOT NULL DEFAULT 0,
  `staff_completed` INT NOT NULL DEFAULT 0,
  `residents_vadmin` INT NOT NULL DEFAULT 0,
  `staff_vadmin` INT NOT NULL DEFAULT 0,
  `web_group` INT NOT NULL DEFAULT 0,
  `address` VARCHAR(45) NOT NULL DEFAULT '0',
  `zipcode` VARCHAR(45) NOT NULL DEFAULT '0',
  `city` VARCHAR(45) NOT NULL DEFAULT '0',
  `county` VARCHAR(45) NOT NULL DEFAULT '0',
  `latitude` FLOAT NOT NULL DEFAULT 0,
  `longitude` FLOAT NOT NULL DEFAULT 0,
  `county_fips` VARCHAR(45) NOT NULL DEFAULT '0',
  `ice_field_office` VARCHAR(45) NOT NULL DEFAULT '0',
  primary key (`id`));

CREATE TABLE `covid_data`.`nyt_counts` (
  id  int(1) unsigned not null AUTO_INCREMENT,
  `date` DATETIME NULL,
  `county` VARCHAR(45) NOT NULL DEFAULT '0',
  `state` VARCHAR(45) NOT NULL DEFAULT '0',
  `fips` VARCHAR(45) NOT NULL DEFAULT '0',
  `cases` INT NOT NULL DEFAULT 0,
  `deaths` INT NOT NULL DEFAULT 0,
  primary key (id));
  

CREATE TABLE `covid_data`.`national_counts` (
  id  int(2) unsigned not null AUTO_INCREMENT,
  `date` DATETIME NULL,
  `measure` VARCHAR(45) NOT NULL DEFAULT '0',
  `count` INT NOT NULL DEFAULT 0,
  `reporting` INT NOT NULL DEFAULT 0,
  `missing` VARCHAR(1024) NOT NULL DEFAULT '0',
  primary key (id));


CREATE TABLE `covid_data`.`state_jurisdiction_counts` (
  id  int(3) unsigned not null AUTO_INCREMENT,
  `state` VARCHAR(45) NOT NULL DEFAULT '0',
  `web.group` VARCHAR(45) NOT NULL DEFAULT '0',
  `measure` VARCHAR(45) NOT NULL DEFAULT '0',
  `val` INT NOT NULL DEFAULT 0,
  `rate` VARCHAR(45) NOT NULL DEFAULT '0',
  `date` DATETIME NULL,
  primary key (id));
  

CREATE TABLE `covid_data`.`state_counts` (
  id  int(4) unsigned not null AUTO_INCREMENT,
  `date` DATETIME NULL,
  `state` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents.confirmed` VARCHAR(45) NOT NULL DEFAULT '0',
  `staff.confirmed` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents.deaths` VARCHAR(45) NOT NULL DEFAULT '0',
  `staff.deaths` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents.tadmin` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents.tested` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents.active` VARCHAR(45) NOT NULL DEFAULT '0',
  `staff.active` VARCHAR(45) NOT NULL DEFAULT '0',
  `staff.initiated` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents.initiated` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents.completed` VARCHAR(45) NOT NULL DEFAULT '0',
  `staff.completed` VARCHAR(45) NOT NULL DEFAULT '0',
  `residents.vadmin` VARCHAR(45) NOT NULL DEFAULT '0',
  `staff.vadmin` VARCHAR(45) NOT NULL DEFAULT '0',
  primary key (id));
  

LOAD DATA LOCAL INFILE  
'../resources/csv/nytimes_counts.csv'
INTO TABLE nyt_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id,date,county,state,fips,cases,deaths);

LOAD DATA LOCAL INFILE
'../resources/csv/cali_historical_facility_counts.csv'
INTO TABLE cali_historical_facility_counts 
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id,facility_id,jurisdiction,state,name,date,source,residents_confirmed,staff_confirmed,residents_deaths,staff_deaths,residents_tadmin,residents_tested,residents_active,staff_active,population_feb20,residents_population,residents_initiated,staff_initiated,residents_completed,staff_completed,residents_vadmin,staff_vadmin,web_group,address,zipcode,city,county,latitude,longitude,county_fips,ice_field_office); 

LOAD DATA LOCAL INFILE  
'../resources/csv/historical_national_counts.csv'
INTO TABLE national_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id,date, measure, count, reporting, missing);


LOAD DATA LOCAL INFILE  
'../resources/csv/historical_state_counts.csv'
INTO TABLE state_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(Date,
State,
`residents.confirmed`,
`staff.confirmed`,
`residents.deaths`,
`staff.deaths`,
`residents.tadmin`,
`residents.tested`,
`residents.active`,
`staff.active`,
`staff.initiated`,
`residents.initiated`,
`residents.completed`,
`staff.completed`,
`residents.vadmin`,
`staff.vadmin`);


LOAD DATA LOCAL INFILE  
'../resources/csv/historical_state_jurisdiction_counts.csv'
INTO TABLE state_jurisdiction_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(State, `Web.Group`, Measure, Val, Rate, Date);
