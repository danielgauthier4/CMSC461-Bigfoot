# Infinite-Monkey-Theorem

## Presentation Layer

To start up a local HTTP server for the presentation layer, you can use a basic Python HTTP server. To get this running, install Python 3 and enter a shell. Within that shell, enter the `presentation` folder and run the following:

```
python -m http.server 8000
```

## Database Layer

First, install either MySQL Server or MariaDB Server and start up the daemon. Then, open a MySQL shell using the following from the command line:

```
mysql --local_infile=1 -u root -p
```

Within that shell, run the following to create the proper tables from the provided data and create the users required for the application layer:

```
SOURCE csv_to_table.sql;
CREATE USER 'springuser'@'localhost' IDENTIFIED BY 'ThePassword';
GRANT ALL PRIVILEGES ON * . * TO 'springuser'@'localhost';
```

Once this is done, you should be able to run the application layer and have it properly connect to the database.
