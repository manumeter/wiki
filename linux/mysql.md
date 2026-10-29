## Create User and Database

```sql
create database `db`;
create user 'user'@localhost identified by 'password';
grant all privileges on `db`.* to 'user'@localhost;
flush privileges;
```

## Delete User and Database

```sql
drop database `db`;
drop user 'user'@localhost;
```
