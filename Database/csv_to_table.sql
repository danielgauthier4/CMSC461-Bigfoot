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
(date,county,state,fips,cases,deaths);


LOAD DATA LOCAL INFILE  
'../resources/csv/historical_national_counts.csv'
INTO TABLE national_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(date, measure, count, reporting, missing);


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
