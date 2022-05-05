# Bigfoot-Backend
This repo is for the application and database layers for the Infinite Monkey Theorem Project.

## Required Software
In order to build this project, you will need to install the following:
- Java Development Kit 1.8.  Generally known as: JDK 1.8
- Maven version 3.6.1
- MySql 8

## Environment Variables
If you are in a Unix-like environment, you will need to add 
these lines to your `.bashrc` file.  Here is an example of
a working `.bashrc` file:

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_251.jdk/Contents/Home
export MAVEN_HOME=$HOME/Development/maven/apache-maven-3.6.1
export MYSQL_HOME=/usr/local/mysql

export PATH=$PATH:${JAVA_HOME}/bin:${MAVEN_HOME}/bin:${MYSQL_HOME}/bin
```

## Build Instructions

In order to build the project, you need to be at the top level
where the `pom.xml` lives.

### To start with a clean build, type:

```bash
$ mvn clean
```

### Update the Hibernate mode

The Hibernate library in SpringBoot will automatically create your database
tables for you based upon the Java Entity clases.  In the 
[CMSC461-Bigfoot/application/src/main/resources/application.properties](src/main/resource/application.properties) file you will need to adjust the **spring.jpa.hibernate.ddl-auto** property.  The checked in setting of this property:
`spring.jpa.hibernate.ddl-auto: none` does **NOT** drop/create the database 
tables.  This is the proper **production** setting for the property.  

When initially setting up the load though, you need this property value
instead: 

```
spring.jpa.hibernate.ddl-auto=create
```

Once you've loaded the database tables, you need to remember to change
the property back to **none**.  Whatever you do, **DO NOT COMMIT application.properties with the value set to `create`**.  When people do a `git pull`, the next time they rebuild the application layer, their database will be deleted!

### To build, type:
```bash
$ mvn install
```

### Commonly, people will do both:
```bash
$ mvn clean install
```

### To run the project, type:
```bash
mvn spring-boot:run
```

### To view Swagger UI, go to this URL in your browser:
`http://localhost:8080/bigfoot/swagger-ui.html`

Our REST endpoints are listed under `main-controller`. 

*Note: The Swagger UI won't show anything useful until you load the 5 database
tables.  Please follow the [database/README.md](../database/README.md) 
instructions to load the database tables with real data.*
