USE employee_db;

INSERT INTO department(name)
VALUES("Sales"),("Engineering"),("Finance"),("Legal");

INSERT INTO role (title,salary,department_id)
VALUES("Sales Lead", 150000,1),("Salesperson", 100000,1),("Lead Engineer", 120000, 2), ("Software Engineer", 100000,2),("Accountant Manager", 100000, 3),("Accountant", 80000, 3),("Legal Team Lead", 90000, 4),("Lawyer", 75000, 4);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES("Brian","Pickel",1,null),("Gentry","Sosa",2,1),("Zoro","Ding",3,null),("Tongtong","DD",4,3),("Rose","Young",5,null),("Alex","Hill",6,5),("Mushroom","Ding",7,null),("Ryan","Gomez",8,7);
