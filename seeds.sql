USE employee_db;

INSERT INTO department(name)
VALUES("Engineering"),("Service"),("Sales");

INSERT INTO role (title,salary,department_id)
VALUES("Salesman", 40000,1),("Sales Manager", 45000,1),("Engineer", 65000, 2), ("Lead Engineer", 72000,2),("Service Manager", 38000, 3),("CSR", 34000, 3);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES("Jacob","Parson",1,null),("Jenny","Hobson",2,1);
