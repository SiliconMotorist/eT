const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

const main = async () => {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "password",
            database: "employee_db"
        });

        console.log(`Connected to DB with id: ${connection.threadId}`);

            run(connection);

    } catch (err) {
        console.log(err);
    }
};

main();

const inqPrompt = async () => {
    return inquirer
        .prompt({
            name: "employee",
            type: "list",
            message: "What would you like to do?",
            choices: ["Add Department", "Add Employee Role","Add Employee","View Departments", "View Roles", "View Employees", "Update Employee Role", "--END--"]
        })
};

const run = async (connection) => {
    const answer = await inqPrompt();
    switch (answer.employee) {
        case "Add Department":
            const addDeptSelection = await addDeptPrompt(connection);
            await addDept(connection, addDeptSelection);
            await run(connection);
            break;
        case "Add Employee Role":
            const addRoleSelection = await addRolePrompt(connection);
            await addRole(connection, addRoleSelection);
            await run(connection);
            break;
        case "Add Employee":
            const addEmployeeSelection = await addEmployeePrompt(connection);
            await addEmployee(connection, addEmployeeSelection);
            await run(connection);
            break;
        case "View Departments":
            await readDept(connection);
            await run(connection);
            break;
        case "View Roles":
            await readRole(connection);
            await run(connection);
            break;
        case "View Employees":
            await readEmployees(connection);
            await run(connection);
            break;
        case "Update Employee Role":
            const updateRoleSelection = await updateRolePrompt(connection);
            await updateRole(connection,updateRoleSelection);
            await run(connection);
            break;
       
        default:
            process.exit();
    };
};

//Add Dept - Prompt
const addDeptPrompt = async (connection) => {
    return inquirer
        .prompt([
            {
                name: "deptName",
                type: "input",
                message: "Enter a department name?"
            }
        ])
};

//Query Dept
const getDept = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM department");
    return rows;
};


//Add Dept to DB
const addDept = async (connection, addDeptSelection) => {
    const sqlQuery = "INSERT INTO department(name) VALUES (?)";
    const params = [addDeptSelection.deptName];
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};

//View Dept
const readDept = async (connection) => {
    const [rows, fields] = await connection.query("SELECT name AS department FROM department");
    console.table(rows);
    return rows;
};


//Add Role - Prompt
const addRolePrompt = async (connection) => {
    let role = await getDept(connection);
    role = role.map((dept) => {
        return `${dept.id}, ${dept.name}`;
    });
    return inquirer
        .prompt([
            {
                name: "title",
                type: "input",
                message: "Enter a job title?"
            },
            {
                name: "salary",
                type: "input",
                message: "Enter a salary?"
            },
            {
                name: "departmentID",
                type: "list",
                message: "Which department does role apply to?",
                choices: role
            }
        ])
};

//Query Managers
const viewManager = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM employee WHERE manager_id IS NULL");
    return rows;
};

//Add Role to DB
const addRole = async (connection, addRoleSelection) => {
    const sqlQuery = ("INSERT INTO role(title,salary,department_id) VALUE(?,?,?)");
    const params = [addRoleSelection.title, addRoleSelection.salary, addRoleSelection.departmentID.split(",")[0]];
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};

//View Role 
const readRole = async (connection) => {
    const [rows, fields] = await connection.query("SELECT role.id,role.title, role.salary, department.name AS department FROM role INNER JOIN department ON department.id = role.department_id ");
    console.table(rows);
    return rows;
};

const getRole = async (connection) => {
    const [rows, fields] = await connection.query("SELECT role.id,role.title, role.salary, department.name AS department FROM role INNER JOIN department ON department.id = role.department_id ");
    return rows;
};

//Add Employees - Prompt
const addEmployeePrompt = async (connection) => {

    let manager = await viewManager(connection);
    manager = manager.map((employee) => {
        return `${employee.id},${employee.first_name},${employee.last_name}`;
    });

    manager.push("N/A");

    const roles = await getRole(connection);
    let viewRoles = roles.map((role) => {
        return `${role.id}, ${role.title}`;
    });

    return inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "Enter the employee's first name?"
            },
            {
                name: "lastName",
                type: "input",
                message: "Enter the employee's last name?"
            },
            {
                name: "roleId",
                type: "list",
                message: "Enter the employee's role?",
                choices: viewRoles
            },
            {
                name: "manager",
                type: "list",
                message: "Enter the employee's manager",
                choices: manager
            }
        ])
};

//Add Employees to DB
const addEmployee = async (connection, addEmployeeSelection) => {
    const sqlQuery = "INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)";

    if (addEmployeeSelection.manager === "None") {
        managerId = null;
    } else { 
        managerId = parseInt(addEmployeeSelection.manager.split(",")[0])
    };
    const params = [addEmployeeSelection.firstName, addEmployeeSelection.lastName, addEmployeeSelection.roleId.split(",")[0], managerId];
    const [rows, fields] = await connection.query(sqlQuery, params);

    console.table(rows);
};

//View Employees
const readEmployees = async (connection) => {
    const sqlQuery = ("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name,' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON role.id = employee.role_id LEFT JOIN department ON department.id=role.department_id LEFT JOIN employee AS manager ON employee.manager_id = manager.id")
    const [rows, fields] = await connection.query(sqlQuery);
    console.table(rows);
};

// View Employees
// const readAllFromEmployee = async (connection) => {
//     const [rows, fields] = await connection.query ("SELECT * FROM employee");
//     console.table(rows);
//     return rows;
// };

const getEmployee = async (connection) => {
    const [rows, fields] = await connection.query ("SELECT * FROM employee");
    return rows;
};

//Update Employee Role - Prompt
const updateRolePrompt = async (connection) => {
    let employees = await getEmployee(connection);
    employees = employees.map((employee) => {
        return `${employee.id}, ${employee.first_name},${employee.last_name}`;
    });

    const roles = await readRole(connection);
    let viewRoles = roles.map((role) => {
        return `${role.id}, ${role.title}`;
    });

    return inquirer
    .prompt([
        {
            name: "role",
            type: "list",
            message: "Enter a employee to update?",
            choices: employees
        },
        {
            name: "newRole",
            type: "list",
            message: "Enter the employee's new role?",
            choices: viewRoles
        }
    ])
};

//Update Employee Role
const updateRole = async (connection,updateRoleSelection) => {
    const sqlQuery = ("UPDATE employee SET role_id = ? WHERE id = ?");
    const params = [updateRoleSelection.newRole.split(",")[0],updateRoleSelection.role.split(",")[0]]
    const [rows, fields] = await connection.query(sqlQuery,params);
    console.table(rows);
};

