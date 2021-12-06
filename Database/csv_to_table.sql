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
  /* `deaths` INT NOT NULL DEFAULT 0,*/
  `cases` INT NOT NULL DEFAULT 0, 
  primary key (id));
  

CREATE TABLE `covid_data`.`national_counts` (
  id  int(2) unsigned not null AUTO_INCREMENT,
  `date` DATETIME NULL,
  /*`measure` VARCHAR(45) NOT NULL DEFAULT '0',
  `count` INT NOT NULL DEFAULT 0,
  `reporting` INT NOT NULL DEFAULT 0,
  `missing` VARCHAR(1024) NOT NULL DEFAULT '0',*/
  primary key (id));


CREATE TABLE `covid_data`.`state_jurisdiction_counts` (
  id  int(3) unsigned not null AUTO_INCREMENT,
  `state` VARCHAR(45) NOT NULL DEFAULT '0',
  `webGroup` VARCHAR(45) NOT NULL DEFAULT '0',
>>>>>>> main
  /*`measure` VARCHAR(45) NOT NULL DEFAULT '0',
  `val` INT NOT NULL DEFAULT 0,
  `rate` VARCHAR(45) NOT NULL DEFAULT '0',*/
  `date` DATETIME NULL,
  primary key (id));
  

CREATE TABLE `covid_data`.`state_counts` (
  id  int(4) unsigned not null AUTO_INCREMENT,
  `date` DATETIME NULL,
  `state` VARCHAR(45) NOT NULL DEFAULT '0',
  `residentsConfirmed` VARCHAR(45) NOT NULL DEFAULT '0',
  `staffConfirmed` VARCHAR(45) NOT NULL DEFAULT '0',
>>>>>>> main
  /*`residents.deaths` VARCHAR(45) NOT NULL DEFAULT '0',
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
  `staff.vadmin` VARCHAR(45) NOT NULL DEFAULT '0',*/
  primary key (id));
  
CREATE TABLE `covid_data`.`facility_counts`(
  id int(5) unsigned not null AUTO_INCREMENT,
  `state` VARCHAR(45) NOT NULL DEFAULT '0',
  `date` DATETIME NULL,
  `residentsConfirmed` VARCHAR(45) NOT NULL DEFAULT '0',
  `staffConfirmed` VARCHAR(45) NOT NULL DEFAULT '0',
  `webGroup` VARCHAR(45) NOT NULL DEFAULT '0',
>>>>>>> main
  `latitude` VARCHAR(45) NOT NULL DEFAULT '0',
  `longitude` VARCHAR(45) NOT NULL DEFAULT '0',
  `fips` VARCHAR(45) NOT NULL DEFAULT '0',
  primary key (id));

CREATE TABLE `covid_data`.`CA_facility` (
  id  int(6) unsigned not null AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL DEFAULT '0', 
  `date` DATETIME NULL,
  `residentConfirmed` VARCHAR(45) NOT NULL DEFAULT '0',
  `staffConfirmed` VARCHAR(45) NOT NULL DEFAULT '0',
  `webGroup` VARCHAR(45) NOT NULL DEFAULT '0',
  `latitude` VARCHAR(45) NOT NULL DEFAULT '0',
  `longtitude` VARCHAR(45) NOT NULL DEFAULT '0',
  `fips` VARCHAR(45) NOT NULL DEFAULT '0',
  primary key (id));

LOAD DATA LOCAL INFILE  
'../resources/csv/cali_historical_facility_counts.csv'
INTO TABLE CA_facility
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, @dummy, @dummy,
name,date,
 @dummy, `residentConfirmed`,`staffConfirmed`,
@dummy, @dummy, @dummy, @dummy, @dummy, @dummy, @dummy, @dummy,
@dummy, @dummy, @dummy, @dummy, @dummy, @dummy, `webGroup`,
>>>>>>> main
@dummy,@dummy,@dummy,@dummy, `latitude`,`longtitude`, `fips`, @dummy);

LOAD DATA LOCAL INFILE  
'../resources/csv/nytimes_counts.csv'
INTO TABLE nyt_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id,date,county,state,fips,cases,@dummy);

LOAD DATA LOCAL INFILE  
'../resources/csv/historical_national_counts.csv'
INTO TABLE national_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id,date, @dummy, @dummy, @dummy, @dummy);


LOAD DATA LOCAL INFILE  
'../resources/csv/historical_state_counts.csv'
INTO TABLE state_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(date,
state,
`residentsConfirmed`,
>>>>>>> main
@dummy,
@dummy,
@dummy,
@dummy,
@dummy,
@dummy,
@dummy,
@dummy,
@dummy,
@dummy,
@dummy,
@dummy,
@dummy);


LOAD DATA LOCAL INFILE  
'../resources/csv/historical_state_jurisdiction_counts.csv'
INTO TABLE state_jurisdiction_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
/*( state, `web.group` , measure, val, rate, date);*/
(state, `webGroup` , @dummy, @dummy, @dummy, date);
>>>>>>> main

LOAD DATA LOCAL INFILE  
'../resources/csv/historical_facility_counts.csv'
INTO TABLE facility_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@dummy, @dummy, 
state, @dummy, 
date , @dummy, `residentsConfirmed`,`staffConfirmed`,
 @dummy, @dummy, @dummy, @dummy, @dummy, @dummy, @dummy,
  @dummy, @dummy, @dummy, @dummy, @dummy, @dummy, `webGroup`,
   @dummy,@dummy,@dummy,@dummy, `latitude`,`longitude`, `fips`, @dummy);