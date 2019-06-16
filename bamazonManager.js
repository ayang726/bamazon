const mysql = require("mysql");
const inquirer = require("inquirer");
const cliTable = require("cli-table");
const delayCall = require("./helper");

const connection = mysql.createConnection({
    hostname: "localhost",
    port: 8889,
    database: "bamazon",
    user: "root",
    password: "root"
});

connection.connect(err => {
    if (err) throw err;
    console.log("Database live: " + connection.threadId);
    runBamazonManagerView();
    // runPurchasePrompt();
});


function runBamazonManagerView() {
    console.log(`
        -------------------------------------
        Welcome to Bamazon Manager View
        -------------------------------------
        `);
    inquirer.prompt([{
        message: "What would you like to do?",
        name: "choices",
        type: "list",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
    }]).then(answers => {
        switch (answers.choices) {
            case "View Products for Sale":
                viewProducts();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Quit":
                connection.end();
                break;
        }
    });
}
function viewProducts() {
    let table = new cliTable({
        head: ["ID", "Product", "Price", "Quantity"]
    });
    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;

        res.forEach(row => {
            table.push([row.id, row.product_name, row.price, row.stock_quantity])
        });
        console.log("Here are the products for sale");
        console.log(table.toString());
        delayCall(runBamazonManagerView);
    });
}


function viewLowInventory() {
    let table = new cliTable({
        head: ["ID", "Product", "Price", "Quantity"]
    });
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", (err, res) => {
        if (err) throw err;

        res.forEach(row => {
            table.push([row.id, row.product_name, row.price, row.stock_quantity])
        });
        console.log("Here are the products for with low inventory");
        console.log(table.toString());
        delayCall(runBamazonManagerView);
    });
}
function addInventory() {
    inquirer.prompt([
        {
            message: "Enter the ID of the item to add inventory",
            name: "id",
            type: "input"
        },
        {
            message: "Enter the quantity to be added",
            name: "quantity",
            type: "number"
        }
    ]).then(answers => {
        connection.query(`UPDATE products
        SET stock_quantity = stock_quantity + ?
        WHERE ?`, [answers.quantity, { id: answers.id }], (err) => {
                if (err) throw err;
                else {
                    console.log("Adding inventory - Sucessful");
                    delayCall(runBamazonManagerView);
                }
            });
    });
}

function addNewProduct() {
    console.log("Adding a new product");
    inquirer.prompt([
        {
            message: "Enter the product's name",
            name: "name",
            type: "input"
        },
        {
            message: "Enter the product's department",
            name: "department",
            type: "input"
        },
        {
            message: "Enter the product's price",
            name: "price",
            type: "number"
        },
        {
            message: "Enter the product's initial quantity",
            name: "quantity",
            type: "number"
        }
    ]).then(answers => {
        connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
            VALUES ("${answers.name}", "${answers.department}", ${answers.price}, ${answers.quantity})`,
            (err, res) => {
                if (err) throw err;
                else {
                    console.log(`Product ${answers.name} successfully created`);
                    delayCall(runBamazonManagerView, 500);
                }

            })

    });
}