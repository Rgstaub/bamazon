"use strict"

const db = require('./connectDB.js');
const inquirer = require('inquirer');
const Table = require('cli-table');

// Connect to the Database
db.connect( (err) => {
  if (err) throw err;
  console.log(`You are now connected to the Bamazon Management database (ID:${db.threadId})`);
  displayActions();
})

// have the user select an action and call that function
let displayActions = () => {
  inquirer.prompt({
    type: 'list',
    name: 'action',
    message: "Select an Operation",
    choices: [
      'View Products for Sale',
      'View Low Inventory',
      'Add to Inventory',
      'Add New Product'
    ]
  }).then((choice) => {
    switch (choice.action) {
      case 'View Products for Sale':
        viewProducts();
        break;
      case 'View Low Inventory':
        viewLowInventory();
        break;
      case 'Add to Inventory':
        pullInventory();
        break;
      case 'Add New Product':
        addProduct();
        break;
    }
  })
}

// Get all the products and lay them out in a table
let viewProducts = () => {
  db.query(`SELECT * FROM products`, (err, res) => {
    if (err) throw err;
    // create the table with headers and column width
    let table = new Table({
      head: ['Product Name', 'Department', 'Price', 'Stock'],
      colWidths: [36, 20, 9, 7]
    })
    // organize the products into an array and push them into the table
    res.forEach((product) => {
      let row = [
        product.product_name, product.department_name,
        `$${product.price}`, product.stock_quantity
      ];
      table.push(row);
    })
    // Display the table
    console.log(table.toString());
    displayActions();
  })
}

// query and return all items with a stock less than 5
let viewLowInventory = () => {
  db.query(`SELECT product_name, stock_quantity FROM products WHERE stock_quantity<5`,
  (err, res) => {
    if (err) throw err;

    console.log('\nLow Inventory Items\n-------------------------');
    res.forEach( (product) => {
      console.log(`${product.product_name} (${product.stock_quantity})`);
    })
    console.log()
    displayActions();
  })
}

let pullInventory = () => {
  let productMenu = [];
  // Pull the relevant data from the database, sort by department
  db.query("SELECT product_name, stock_quantity, department_name, item_id FROM products ORDER BY department_name ASC",
    (err, res) => {
      if (err) throw err;

      res.forEach((product) => {
        let str = `${item_id} - ${department_name} - ${product_name} stock: ${stock_quantity}`;
        productMenu.push(str);
      })
    }
    inquirer.prompt({
      type: 'list',
      name: 'product',
      message: 'Select a product to add inventory',
      choices: productMenu
    })
    .then((choice) => {
      let words = choice.product.split(" ");
      itemId = words[0];
      addInventory(itemId);
    })
  )
}

let addInventory = (id) => {
  db.query("SELECT product_name, stock_quantity, price FROM products WHERE ?",
    {item_id: id},
    (err, res) => {
      if (err) throw error;

      console.log(`${product_name} - current stock: ${stock_quantity}`)
      inquirer.prompt({
        type: 'input',
        name: 'addQty',
        message: "How many units would you like to add?",
        validate: function(qty) {
          let num = Number.parseFloat(input);
          if (!Number.isInteger(num) || num < 0) return false;
          else return true;
        }
      })
      .then((input) => {
        db.query("UPDATE products SET ? WHERE ?",
          [{
            stock_quantity: input.addQty
          },
          {
            item_id: id
          }],
          (err, res) => {
            if (err) throw err;
            console.log(res);
          }
        )
      })
    }
  )
}

let addProduct = () => {

}