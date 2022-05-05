# CMSC461-Bigfoot

## Database Layer

First, install either MySQL Server or MariaDB Server and start up the daemon. Then, open a MySQL shell using the following from the command line:

```bash
cd CMSC461-Bigfoot/database
mysql --local_infile=1 -u root -p
```

If you do not know want the root password is, follow these [instructions](https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html).

Within that shell, run the following to create the proper tables from the provided data and create the users required for the application layer:

```sql
CREATE USER 'springuser'@'localhost' IDENTIFIED BY 'ThePassword';
GRANT ALL PRIVILEGES ON * . * TO 'springuser'@'localhost';
SOURCE full_report.sql;
SOURCE location.sql;
SOURCE report_classification.sql;
SOURCE report_time.sql;
SOURCE weather.sql;
commit;
```

Once this is done, you should be able to run the application layer and have it properly connect to the database.

## 
