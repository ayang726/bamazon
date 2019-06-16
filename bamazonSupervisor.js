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
    runBamazonSupervisorView();
});


function runBamazonSupervisorView() {
    console.log(`
        -------------------------------------
        Welcome to Bamazon Supervisor View
        -------------------------------------
        `);
    inquirer.prompt([{
        message: "What would you like to do?",
        name: "choices",
        type: "list",
        choices: ["View Product Sales By Department", "Add Department", "Quit"]
    }]).then(answers => {
        switch (answers.choices) {
            case "View Product Sales By Department":
                viewProductSales();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Quit":
                connection.end();
                break;
        }
    });
}

function viewProductSales() {
    let table = new cliTable({
        head: ["ID", "Department Name", "Overhead Cost", "Product Sales", "Total Profit"]
    });
    connection.query(`
    SELECT departments.*, 
        SUM(products.product_sales) AS product_sales, 
        SUM(products.product_sales) - departments.overhead_cost AS total_profit
    FROM departments
    INNER JOIN products
    WHERE departments.department_name = products.department_name
    GROUP by departments.id;`,
        (err, res) => {
            if (err) throw err;
            res.forEach(row => {
                table.push([row.id, row.department_name, row.overhead_cost, row.product_sales, row.total_profit])
            });
            console.log(table.toString());
            delayCall(runBamazonSupervisorView, 5000);
        })
}

function addDepartment() {
    inquirer.prompt([
        {
            message: "What's the name of the new department?",
            name: "name",
            type: "input"
        },
        {
            message: "What's the overhead cost of the new department?",
            name: "overhead",
            type: "number"
        }
    ]).then(answers => {
        connection.query(`INSERT INTO departments (department_name, overhead_cost)
        VALUES (?, ?) `, [answers.name, answers.overhead], (err, res) => {
                if (err) throw err;
                console.log("Successfully added " + answers.name + " to the department list");
                delayCall(runBamazonSupervisorView);
            })
    });
}