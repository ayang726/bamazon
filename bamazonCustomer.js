const mysql = require("mysql");
const inquirer = require("inquirer");
const cliTable = require("cli-table");

const connection = mysql.createConnection({
    hostname: "localhost",
    port: 8889,
    database: "bamazon",
    user: "root",
    password: "root",
    multipleStatements: true
});

connection.connect(err => {
    if (err) throw err;
    console.log("Database live: " + connection.threadId);
    runBamazonCustomer();
    // runPurchasePrompt();
});

let cart = [];

function runBamazonCustomer() {
    console.log(`
    -------------------------------------
    Welcome to Bamazon
    Here are a list of products for sale
    -------------------------------------`);
    connection.query("SELECT id, product_name, price FROM products", (err, res) => {
        if (err) throw err;
        let productTable = new cliTable({
            head: ["ID", "Product", "Price"]
        });
        res.forEach(row => {
            // console.log(`${row.id} ${row.product_name}: $${row.price}`);
            productTable.push([row.id, row.product_name, "$" + row.price]);
        });
        console.log(productTable.toString());
        runCustomerSelection();

    });
}

function runCustomerSelection() {
    inquirer.prompt([
        {
            message: "What would you like to do?",
            name: "action",
            type: "list",
            choices: ["Buy", "View Product", "View Cart", "Check-Out", "Quit (Discard Cart)"]
        }
    ]).then(answers => {
        switch (answers.action) {
            case "Buy":
                runPurchasePrompt();
                // connection.end();
                break;
            case "View Product":
                runBamazonCustomer();
                break;
            case "View Cart":
                viewCart();
                break;
            case "Check-Out":
                checkOut();
                break;
            case "Quit (Discard Cart)":
                connection.end();
                break;
        }
    });
}

function runPurchasePrompt() {
    inquirer.prompt([
        {
            message: "Enter the product ID you wish to purchase",
            name: "id",
            type: "input"
        },
        {
            message: 'Enter the quantity you with to purchase',
            name: "quantity",
            type: "number"
        }
    ]).then(answers => {
        const id = answers.id;
        const quantity = answers.quantity;

        let alreadyInCart = false;
        cart.forEach(e => {
            if (e.id === id) alreadyInCart = true;
        });

        if (alreadyInCart) {
            console.log('You cannot add to cart an item twice...');
            setTimeout(() => {
                runCustomerSelection();
            }, 2000);
        } else {
            connection.query("SELECT * FROM products WHERE ?", {
                id: id
            }, (err, res) => {
                if (err) throw err;
                const productName = res[0].product_name;
                const storeQuantity = res[0].stock_quantity;
                const price = res[0].price;
                const department = res[0].department;
                if (quantity <= storeQuantity) {
                    inquirer.prompt([{
                        message: `You wish to buy ${quantity} ${productName}`,
                        name: "confirm",
                        type: "confirm",
                        default: "Y"
                    }]).then(answers => {
                        if (answers.confirm) {
                            cart.push({
                                id,
                                productName,
                                quantity,
                                department,
                                subtotal: price * quantity
                            });
                            runCustomerSelection();
                        } else {
                            runCustomerSelection();
                        }
                    });
                } else {
                    console.log(`
Not enough ${productName} stock
There are currently ${storeQuantity} ${productName} in stock`);
                    setTimeout(() => {
                        runCustomerSelection();
                    }, 2000);
                }

            });
        }

    });
}

function viewCart() {
    if (cart.length !== 0) {
        console.log("Here are the items in your cart:");
        let table = new cliTable({
            head: ["Product", "Quantity", "SubTotal"]
        });
        cart.forEach(e => {
            table.push([e.productName, e.quantity, e.subtotal]);
        });
        console.log(table.toString());

    } else {
        console.log('Your cart is empty');
    }
    setTimeout(() => {
        runCustomerSelection();
    }, 2000);
}


function checkOut() {
    // console.log("Checking you out");

    let successful = true;
    let total = 0;
    cart.forEach((item, index) => {

        connection.query(`
        UPDATE products 
        SET stock_quantity = stock_quantity -  ?,
            product_sales = product_sales + ?
        WHERE ?;
        `,
            [item.quantity, item.subtotal, { id: item.id }],
            (err) => {
                if (err) {
                    successful = false;
                    throw err;
                } else {
                    console.log(`Checking out ${item.productName} successful`);
                    total += item.subtotal;
                    if (index === cart.length - 1) {
                        if (successful) {
                            console.log('Transaction successful your total today will be $' + total);
                            console.log('Thanks for shopping with us!');
                        } else {
                            console.log('Something went wrong, please try again later');
                        }
                        connection.end();
                    }
                }
            });

    });

}