const db = require('./connectDB.js');
const inquirer = require('inquirer');

// Connect to the Database
db.connect( (err) => {
  if (err) throw err;
  console.log(`You are now connected to the Bamazon database (ID:${db.threadId})`);
  displayProducts();
})

// Once connected, present the user with a choice of all products
let displayProducts = () => {
  let productArray = [];
  db.query('SELECT * FROM products', (err, res) => {
    if (err) throw err;
    // Create an array of all product names to be presented to the user
    res.forEach( (item) => {
      productArray.push(item.product_name);
    })
    inquirer.prompt({
      type: 'list',
      name: 'productList',
      message: '\nPlease make a selection from the available products\n',
      choices: productArray
    }).then( (product) => {
      displayDetails(product.productList);
    })
  }) 
}

// Take the user selection and display the cost. Prompt user for quantity to purchase
let displayDetails = (product) => {
  console.log(`\n==========| ${product} |==========`);
  db.query('SELECT price, department_name, stock_quantity FROM products WHERE ?',
    {product_name: product},
    (err, res) => {
      if (err) throw err;
      console.log(`Department: ${res[0].department_name}\nPrice: $${res[0].price}\nAvailavle Quantity: ${res[0].stock_quantity}\n`);
  
      inquirer.prompt({
        type: 'input',
        name: 'purchaseQty',
        message: "How many would you like to purchase? (enter 0 to return to the products list)",
        validate: function(qty) {
          num = Number.parseFloat(qty);

          if (!Number.isInteger(num) || num < 0) {
            return false;
          } else if (num > res[0].stock_quantity) {
            console.log(`\n\n-=- You can't order that many! Check the current stock (${res[0].stock_quantity}) and try again.\n`)
            return false;
          } else return true;
        }
      })
      .then( (qty) => {
        let orderQty = Number.parseInt(qty.purchaseQty);
        if ( orderQty === 0) {
          return displayProducts();
        }
        console.log(`Order Complete!\n\n==========| Invoice |==========\nItem: ${product}\nPrice: $${res[0].price}\nQuantity: ${orderQty}\n-----------------\nPurchase Total: ${res[0].price * orderQty}`);
      })
    }  
  )
}