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

/*create database*/
CREATE DATABASE covid_data;

USE covid_data;
 /*create nyt_counts and ca_facility table*/
CREATE TABLE `covid_data`.`nyt_counts` (
  id  int(1) unsigned not null AUTO_INCREMENT, /*create unique id*/
  `date` DATETIME NULL,
  `county` VARCHAR(45) NOT NULL DEFAULT '0',
  `state` VARCHAR(45) NOT NULL DEFAULT '0',
  `fips` VARCHAR(45) NOT NULL DEFAULT '0',
  `cases` INT NOT NULL DEFAULT 0, 
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

/*load data from .csv files into corresponding tables. Using @dummy to only read in neccessary columns.*/
LOAD DATA LOCAL INFILE  
'../resources/csv/cali_historical_facility_counts.csv'
INTO TABLE CA_facility
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, @dummy, @dummy, name,date,
@dummy, `residentConfirmed`,`staffConfirmed`,
@dummy, @dummy, @dummy, @dummy, @dummy, @dummy, @dummy, @dummy,
@dummy, @dummy, @dummy, @dummy, @dummy, @dummy, `webGroup`,
@dummy,@dummy,@dummy,@dummy, `latitude`,`longtitude`, `fips`, @dummy);

LOAD DATA LOCAL INFILE  
'../resources/csv/nytimes_counts.csv'
INTO TABLE nyt_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id,date,county,state,fips,cases,@dummy);

DELETE FROM nyt_counts WHERE id = 58744; /*delelete last row in nyt_counts table since it has incomplete data. */