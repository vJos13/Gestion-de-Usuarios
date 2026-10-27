IF DB_ID('miapp_sql') IS NULL
    CREATE DATABASE miapp_sql;
GO

USE miapp_sql;
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
    CREATE TABLE Users (
        id INT PRIMARY KEY IDENTITY(1,1),
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE
    );
GO

-- Datos de ejemplo (opcional)
IF NOT EXISTS (SELECT 1 FROM Users)
    INSERT INTO Users (name, email) VALUES
        ('Ana Torres', 'ana@example.com'),
        ('Luis Ramos', 'luis@example.com');
GO
