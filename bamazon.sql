DROP DATABASE IF EXISTS bamazondb;

CREATE DATABASE bamazondb;

USE bamazondb;

CREATE TABLE products(
	item_id INT(11) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT(10) NOT NULL,
    PRIMARY KEY(item_id)
    );
    
   INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES 
		('Shamsung 55" Full SD TV', 'Electronics', 360.99, 12),
		('Queasyfart Food Processor', 'Kitchen/Appliances', 45.18, 6),
        ('Tony Fullfigure Boat Shoes', 'Apparel', 253.09, 2),
        ('AichPee 13" Notebook Computer - 128MB', 'Electronics', 69.99, 50),
        ('Divergent Games Book 9: Aimless Wandering', 'Books', 19.86, 20),
        ('"Gourmet" Microwave Dinner', 'Food', 2.99, 18),
        ('Dealing with your Online Shopping Addiction', 'Books', 12.99, 8),
        ('myPhone 5G - unlocked', 'Electronics', 399.99, 18),
        ('Queasyfart EZ Strudel Toaster', 'Kitchen/Appliances', 12.45, 22),
        ('Unisex Dashiki by Ivanka Trump', 'Apparel', 499.99, 4);
        
	SELECT * FROM products;