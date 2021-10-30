/*
TO RUN THIS SCRIPT
	-Download MySQL.
	-Enter cmd prompt and add MySQL path to PATH 
		(e.g. for Windows: "set PATH=%PATH%;C:\Program Files\MySQL\MySQL Server 8.0\bin")
	-cd to this script's directory and run MySQL client with --local_infile flag enabled
		("mysql --local_infile=1 -u root -p")
	-Run the script
		("SOURCE csv_to_table.sql;")
*/


CREATE DATABASE covid_data;

USE covid_data;

CREATE TABLE `covid_data`.`nyt_counts` (
  `date` VARCHAR(45) NULL,
  `county` VARCHAR(45) NULL,
  `state` VARCHAR(45) NULL,
  `fips` VARCHAR(45) NULL,
  `cases` INT NULL,
  `deaths` INT NULL);
  

CREATE TABLE `covid_data`.`national_counts` (
  `Date` DATETIME NULL,
  `Measure` VARCHAR(45) NULL,
  `Count` INT NULL,
  `Reporting` INT NULL,
  `Missing` VARCHAR(1024) NULL);


CREATE TABLE `covid_data`.`state_jurisdiction_counts` (
  `State` VARCHAR(45) NULL,
  `Web.Group` VARCHAR(45) NULL,
  `MEASURE` VARCHAR(45) NULL,
  `VAL` INT NULL,
  `Rate` VARCHAR(45) NULL,
  `Date` DATETIME NULL);
  

CREATE TABLE `covid_data`.`state_counts` (
  `Date` DATETIME NULL,
  `State` VARCHAR(45) NULL,
  `Residents.Confirmed` VARCHAR(45) NULL,
  `Staff.Confirmed` VARCHAR(45) NULL,
  `Residents.Deaths` VARCHAR(45) NULL,
  `Staff.Deaths` VARCHAR(45) NULL,
  `Residents.Tadmin` VARCHAR(45) NULL,
  `Residents.Tested` VARCHAR(45) NULL,
  `Residents.Active` VARCHAR(45) NULL,
  `Staff.Active` VARCHAR(45) NULL,
  `Staff.Initiated` VARCHAR(45) NULL,
  `Residents.Initiated` VARCHAR(45) NULL,
  `Residents.Completed` VARCHAR(45) NULL,
  `Staff.Completed` VARCHAR(45) NULL,
  `Residents.Vadmin` VARCHAR(45) NULL,
  `Staff.Vadmin` VARCHAR(45) NULL);
  

LOAD DATA LOCAL INFILE  
'csv/nytimes_counts.csv'
INTO TABLE nyt_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(date,county,state,fips,cases,deaths);


LOAD DATA LOCAL INFILE  
'csv/historical_national_counts.csv'
INTO TABLE national_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(Date, Measure, Count, Reporting, Missing);


LOAD DATA LOCAL INFILE  
'csv/historical_state_counts.csv'
INTO TABLE state_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(Date,
State,
`Residents.Confirmed`,
`Staff.Confirmed`,
`Residents.Deaths`,
`Staff.Deaths`,
`Residents.Tadmin`,
`Residents.Tested`,
`Residents.Active`,
`Staff.Active`,
`Staff.Initiated`,
`Residents.Initiated`,
`Residents.Completed`,
`Staff.Completed`,
`Residents.Vadmin`,
`Staff.Vadmin`);


LOAD DATA LOCAL INFILE  
'csv/historical_state_jurisdiction_counts.csv'
INTO TABLE state_jurisdiction_counts
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(State, `Web.Group`, Measure, Val, Rate, Date);
