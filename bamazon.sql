DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    id INT AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT(5) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
("tv", "electronics", 1500, 10),
("iphone", "electronics", 1000, 100),
("t-shirt", "styles", 20, 20),
("shoes", "styles", 100, 5),
("couch", "furnitures", 500, 2),
("books", "entertainment", 29.50, 10),
("movies", "entertainment", 20, 50),
("music", "entertainment", 1.99, 100),
("jacket", "styles", 100, 1),
("fan", "furnitures", 30, 0),
("computer", "electronics", 1500, 10);
