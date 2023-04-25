## Create User and Database

    create database `db`;
    create user 'user'@localhost identified by 'password';
    grant all privileges on `db`.* to 'user'@localhost;
    flush privileges;

## Delete User and Database

    drop database `db`;
    drop user 'user'@localhost;
