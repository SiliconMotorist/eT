const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
const cTable = require("console.table");

const main = async () => {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "password",
            database: "employee_db"
        });

        console.log(`Connected to db with id: ${connection.threadId}`);

        start(connection);

    } catch (err) {
        console.log(err);
    }
};

main();

const startPrompt = async () => {
    return inquirer
        .prompt({
            name: "employee",
            type: "list",
            message: "What would you like to do?",
            choices: ["Add Department", "Add Employee Role","Add Employee","View Departments", "View Roles", "View Employees", "Update Employee Role", "--END--"]
        })
};

const start = async (connection) => {
    const answer = await startPrompt();
    switch (answer.employee) {
        case "Add Department":
            const addDeparmentAns = await addDepartmentPrompt(connection);
            await addDepartment(connection, addDeparmentAns);
            await start(connection);
            break;
        case "Add Employee Role":
            const addRoleAns = await addRolePrompt(connection);
            await addRole(connection, addRoleAns);
            await start(connection);
            break;
        case "Add Employee":
            const addEmployeeAns = await addEmployeePrompt(connection);
            await addEmployee(connection, addEmployeeAns);
            await start(connection);
            break;
        case "View Departments":
            await readAllDepartment(connection);
            await start(connection);
            break;
        case "View Roles":
            await readAllRole(connection);
            await start(connection);
            break;
        case "View Employees":
            await readAllEmplyees(connection);
            await start(connection);
            break;
        case "Update Employee Role":
            const updateRoleAns = await updateRolePrompt(connection);
            await updateRole(connection,updateRoleAns);
            await start(connection);
            break;
       
        default:
            process.exit();
    };
};

//view department name
const readAllDepartment = async (connection) => {
    const [rows, fields] = await connection.query("SELECT name AS department FROM department");
    console.table(rows);
    return rows;
};

//query with all info from department table
const getDepartment = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM department");
    return rows;
};

//prompt questions - department info
const addDepartmentPrompt = async (connection) => {
    return inquirer
        .prompt([
            {
                name: "departmentName",
                type: "input",
                message: "What is the department name?"
            }
        ])
};

//Add new department to database
const addDepartment = async (connection, addDeparmentAns) => {
    const sqlQuery = "INSERT INTO department(name) VALUES (?)";
    const params = [addDeparmentAns.departmentName];
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};


//view roles title, salary, department name
const readAllRole = async (connection) => {
    const [rows, fields] = await connection.query("SELECT role.id,role.title, role.salary, department.name AS department FROM role INNER JOIN department ON department.id = role.department_id ");
    console.table(rows);
    return rows;
};

const getRole = async (connection) => {
    const [rows, fields] = await connection.query("SELECT role.id,role.title, role.salary, department.name AS department FROM role INNER JOIN department ON department.id = role.department_id ");
    return rows;
};

//create new role - prompt questions
const addRolePrompt = async (connection) => {
    let allDepartments = await getDepartment(connection);
    allDepartments = allDepartments.map((department) => {
        return `${department.id}, ${department.name}`;
    });
    return inquirer
        .prompt([
            {
                name: "title",
                type: "input",
                message: "What is the job title?"
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary?"
            },
            {
                name: "departmentID",
                type: "list",
                message: "Which department does the job belong to?",
                choices: allDepartments
            }
        ])
};

//create new role to database
const addRole = async (connection, addRoleAns) => {
    const sqlQuery = ("INSERT INTO role(title,salary,department_id) VALUE(?,?,?)");
    const params = [addRoleAns.title, addRoleAns.salary, addRoleAns.departmentID.split(",")[0]];
    const [rows, fields] = await connection.query(sqlQuery, params);
    console.table(rows);
};


//view all employees
const readAllEmplyees = async (connection) => {
    const sqlQuery = ("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name,' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON role.id = employee.role_id LEFT JOIN department ON department.id=role.department_id LEFT JOIN employee AS manager ON employee.manager_id = manager.id")
    const [rows, fields] = await connection.query(sqlQuery);
    console.table(rows);
};

//query with manager name
const viewManager = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM employee WHERE manager_id IS NULL");
    return rows;
};

//add new employee - prompt questions - employee info
const addEmployeePrompt = async (connection) => {

    let allManager = await viewManager(connection);
    allManager = allManager.map((employee) => {
        return `${employee.id},${employee.first_name},${employee.last_name}`;
    });

    allManager.push("None");

    const allRoles = await getRole(connection);
    let viewAllRoles = allRoles.map((role) => {
        return `${role.id}, ${role.title}`;
    });

    return inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name: "lastName",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
                name: "roleId",
                type: "list",
                message: "What is the employee's role?",
                choices: viewAllRoles
            },
            {
                name: "manager",
                type: "list",
                message: "Who is the employee's manager",
                choices: allManager
            }
        ])
};

//add employees to database
const addEmployee = async (connection, addEmployeeAns) => {
    const sqlQuery = "INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)";

    if (addEmployeeAns.manager === "None") {
        managerId = null;
    } else { 
        managerId = parseInt(addEmployeeAns.manager.split(",")[0])
    };
    const params = [addEmployeeAns.firstName, addEmployeeAns.lastName, addEmployeeAns.roleId.split(",")[0], managerId];
    const [rows, fields] = await connection.query(sqlQuery, params);

    console.table(rows);
};

//view all from employee
const readAllFromEmployee = async (connection) => {
    const [rows, fields] = await connection.query ("SELECT * FROM employee");
    console.table(rows);
    return rows;
};

const getEmployee = async (connection) => {
    const [rows, fields] = await connection.query ("SELECT * FROM employee");
    return rows;
};

//update employee role - prompt role
const updateRolePrompt = async (connection) => {
    let allEmployees = await getEmployee(connection);
    allEmployees = allEmployees.map((employee) => {
        return `${employee.id}, ${employee.first_name},${employee.last_name}`;
    });

    const allRoles = await readAllRole(connection);
    let viewAllRoles = allRoles.map((role) => {
        return `${role.id}, ${role.title}`;
    });

    return inquirer
    .prompt([
        {
            name: "role",
            type: "list",
            message: "Which employee'role would you like to update?",
            choices: allEmployees
        },
        {
            name: "newRole",
            type: "list",
            message: "What is the employee's new role?",
            choices: viewAllRoles
        }
    ])
};

//update employee role
const updateRole = async (connection,updateRoleAns) => {
    const sqlQuery = ("UPDATE employee SET role_id = ? WHERE id = ?");
    const params = [updateRoleAns.newRole.split(",")[0],updateRoleAns.role.split(",")[0]]
    const [rows, fields] = await connection.query(sqlQuery,params);
    console.table(rows);
};

