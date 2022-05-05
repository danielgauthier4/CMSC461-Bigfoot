# Bigfoot Database

The Bigfoot Project uses Mysql 8.0.27.  MariaDB and other versions of Mysql
may work, or maybe not.

## Checking out the Bigfoot project

Check out the Bigfoot project from [github](https://github.com/danielgauthier4/CMSC461-Bigfoot).

## Building the backend

**Important: Building the Java backend will create your database tables for you automatically.**

Follow the instructions in the application [README.md](../application/README.md) file.

## Loading data into your local database

In a bash shell, type:

```bash
cd CMSC461-Bigfoot/database

mysql --local_infile=1 -u springuser -p                (you will be prompted for the password which is "ThePassword")
```

You should now see the mysql> prompt.  Type the following SQL commands:
```sql  
CREATE USER 'springuser'@'localhost' IDENTIFIED BY 'ThePassword';
GRANT ALL PRIVILEGES ON * . * TO 'springuser'@'localhost';
use bigfoot;
source full_report.sql;
source location.sql;
source report_classification.sql;
source report_time.sql;
source weather.sql;
commit;

# Now verify that you have 5 tables with this command:
show tables;

# Now verify that each table has 4000 to 5000 rows (roughly)
select count(*) from full_report;
select count(*) from location;
select count(*) from report_classification;
select count(*) from report_time;
select count(*) from weather;
exit
```
