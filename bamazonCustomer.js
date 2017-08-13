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
  db.query('SELECT price FROM products WHERE ?',
    {product_name: product},
    (err, res) => {
      if (err) throw err;
      console.log(`Price: $${res[0].price}`);
    }
  )
}