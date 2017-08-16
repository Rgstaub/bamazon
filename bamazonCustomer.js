"use strict"

const db = require('./connectDB.js');
const inquirer = require('inquirer');

// Connect to the Database
db.connect( (err) => {
  if (err) throw err;
  console.log(`You are now connected to the Bamazon Management database (ID:${db.threadId})`);
  displayProducts();
})

// Once connected, present the user with a choice of all products
let displayProducts = () => {
  let productArray = [];
  db.query('SELECT * FROM products', (err, res) => {
    if (err) throw err;
    // Create an array of all product names to be presented to the user
    res.forEach((item) => productArray.push(item.product_name));
    inquirer.prompt({
      type: 'list',
      name: 'productList', 
      message: '\nPlease make a selection from the available products\n',
      choices: productArray
    }).then( (product) => {
      // continue to display details for selected item
      displayDetails(product.productList);
    })
  }) 
}

// Take the user selection and display the cost, stock, and department. Prompt user for quantity to purchase
let displayDetails = (product) => {
  console.log(`\n==========| ${product} |==========`);
  db.query('SELECT price, department_name, stock_quantity FROM products WHERE ?',
    {product_name: product},
    (err, res) => {
      if (err) throw err;
      // variables for readability
      let dept = res[0].department_name;
      let price = res[0].price;
      let stock = res[0].stock_quantity;
      // Display the item details
      console.log(`Department: ${dept}\nPrice: $${price}\nAvailavle Quantity: ${stock}\n`);
      // get the quantity desired from the user
      inquirer.prompt({
        type: 'input',
        name: 'purchaseQty',
        message: "How many would you like to purchase? (enter 0 to return to the products list)",
        // Validate for only positive integers and 0
        validate: function(input) {
          let num = Number.parseFloat(input);
          if (!Number.isInteger(num) || num < 0) return false;
          else if (num > stock) {
            console.log(`\n\n-=- You can't order that many! Check the current stock (${stock}) and try again.\n`)
            return false;
          } else return true;
        }
      })
      .then((input) => {
        let orderQty = Number.parseInt(input.purchaseQty);
        // Go back for qty=0
        if ( orderQty === 0) return displayProducts();
        // Continue to confirm purchase for valid quantities
        else confirmPurchase(product, stock, orderQty, price);
      })
    }  
  )
}

// just like it sounds...
let confirmPurchase = (product, stock, qty, price) => {
  // Make sure this number is pretty
  let totalPrice = Math.round((price*qty)*100)/100;
  inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `\nAre you sure you want to purchase (${qty}) '${product}' for a total of ${totalPrice}?`
  }).then((confirm) => {
    // Update the inventories
    if (confirm.confirm) updateStock(product, stock, qty, price, totalPrice);
    // or else return to the product details screen
    else displayDetails(product);
  })
}

// complete the transaction by updating inventories in the DB and presenting invoice to user
let updateStock = (product, stock, qty, price, totalPrice) => {
  db.query(`UPDATE products SET ? WHERE ?`,
    [{stock_quantity: stock-qty},
    {product_name: product}],
    (err, res) => {
      if (err) throw err;
      else {
        console.log("\nPurchase confirmed.\n");
        console.log(`Order Complete!\n\n==========| Invoice |==========\nItem: ${product}\nPrice: $${totalPrice}\nQuantity: ${qty}\n-----------------\nPurchase Total: ${totalPrice}`);
        // See if they want to spend more money. Kick them out if not
        inquirer.prompt({
          type: 'confirm',
          name: 'continue',
          message: '\nContinue Shopping?'
        }).then((choice) => {
          if (choice.continue) displayProducts();
          else {
            console.log("\nGoodbye!\n");
            db.end();
          }
        })
      }
    }
  )
}
