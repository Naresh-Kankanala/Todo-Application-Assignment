const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

let priorityArray = ["HIGH", "MEDIUM", "LOW"];
let statusArray = ["TO DO", "IN PROGRESS", "DONE"];
let categoryArray = ["WORK", "HOME", "LEARNING"];
let dateArray = [
  "2021-04-04",
  "2020-09-22",
  "2021-02-22",
  "2021-01-12",
  "2021-04-02",
];

//API 1

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  let responseData = null;
  let getQuery = "";
  const { search_q = "", category, priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatus(request.query):
      if (priorityArray.includes(priority)) {
        if (statusArray.includes(status)) {
          getQuery = `
                SELECT id, todo, priority, status, category, due_date AS dueDate
                FROM todo
                WHERE priority = '${priority}' AND status = '${status}' AND todo LIKE '%${search_q}%';`;
          responseData = await db.all(getQuery);
          response.send(responseData);
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    case hasCategoryAndStatus(request.query):
      if (categoryArray.includes(category)) {
        if (statusArray.includes(status)) {
          getQuery = `
                SELECT id, todo, priority, status, category, due_date AS dueDate
                FROM todo
                WHERE category = '${category}' AND status = '${status}' AND todo LIKE '%${search_q}%';`;
          responseData = await db.all(getQuery);
          response.send(responseData);
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryAndPriority(request.query):
      if (categoryArray.includes(category)) {
        if (priorityArray.includes(priority)) {
          getQuery = `
                SELECT id, todo, priority, status, category, due_date AS dueDate
                FROM todo
                WHERE priority = '${priority}' AND category = '${category}' AND todo LIKE '%${search_q}%';`;
          responseData = await db.all(getQuery);
          response.send(responseData);
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategory(request.query):
      if (categoryArray.includes(category)) {
        getQuery = `
            SELECT id, todo, priority, status, category, due_date AS dueDate
            FROM todo
            WHERE category = '${category}' AND todo LIKE '%${search_q}%';`;
        responseData = await db.all(getQuery);
        response.send(responseData);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasStatus(request.query):
      if (statusArray.includes(status)) {
        getQuery = `
            SELECT id, todo, priority, status, category, due_date AS dueDate
            FROM todo
            WHERE status = '${status}' AND todo LIKE '%${search_q}%';`;
        responseData = await db.all(getQuery);
        response.send(responseData);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasPriority(request.query):
      if (priorityArray.includes(priority)) {
        getQuery = `
            SELECT id, todo, priority, status, category, due_date AS dueDate
            FROM todo
            WHERE priority = '${priority}' AND todo LIKE '%${search_q}%';`;
        responseData = await db.all(getQuery);
        response.send(responseData);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    default:
      getQuery = `
            SELECT id, todo, priority, status, category, due_date AS dueDate
            FROM todo
            WHERE todo LIKE '%${search_q}%';`;
      responseData = await db.all(getQuery);
      response.send(responseData);
      break;
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
            SELECT id, todo, priority, status, category, due_date AS dueDate
            FROM todo
            WHERE id = ${todoId};`;
  const responseDB = await db.get(getQuery);
  response.send(responseDB);
});

//API 3

app.get("/agenda/", async (request, response) => {
  let { date } = request.query;
  let dateList = [];
  let dateStringList = date.split("-");
  for (let item of dateStringList) {
    item = parseInt(item);
    dateList.push(item);
  }
  let userEnteredDate = format(
    new Date(dateList[0], dateList[1] - 1, dateList[2]),
    "yyyy-MM-dd"
  );
  let stringifiedDate = String(userEnteredDate);
  console.log(stringifiedDate);
  if (dateArray.includes(stringifiedDate)) {
    const getQuery = `
                SELECT id, todo, priority, status, category, due_date AS dueDate FROM todo WHERE due_date = '${stringifiedDate}';`;
    const responseDB = await db.all(getQuery);
    response.send(responseDB);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if (priorityArray.includes(priority)) {
      if (statusArray.includes(status)) {
          if (categoryArray.includes(category)) {
              const postQuery = `
                INSERT INTO 
                todo(id, todo, priority, status, category, due_date)
                VALUES (
                '${id}', '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
               const responseDB = await db.run(postQuery);
               response.send("Todo Successfully Added");
          }
          else {
              response.status(400);
              response.send("Invalid Todo Category");
          }
      }
      else {
          response.status(400);
          response.send("Invalid Todo Status");
      }
  }
  else {
      response.status(400);
      response.send("Invalid Todo Priority");
  }
  
});

//API 5

const updateStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const updatePriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const updateTodo = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

const updateCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const updateDueDate = (requestQuery) => {
  return requestQuery.dueDate !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateQuery = "";

  switch (true) {
    case updateStatus(request.body):
      const { status } = request.body;
      if (statusArray.includes(status)) {
            updateQuery = `
                UPDATE todo
                SET status = '${status}';`;
            await db.run(updateQuery);
            response.send("Status Updated");
            break;
      }
      else {
          response.status(400);
          response.send("Invalid Todo Status");
          break;
      }
      
    case updatePriority(request.body):
      const { priority } = request.body;
      if (priorityArray.includes(priority)) {
            updateQuery = `
                UPDATE todo
                SET priority = '${priority}';`;
            await db.run(updateQuery);
            response.send("Priority Updated");
            break;
      }
      else {
          response.status(400);
          response.send("Invalid Todo Priority");
          break;
      }
    case updateCategory(request.body):
      const { category } = request.body;
      if (categoryArray.includes(category)) {
            updateQuery = `
                UPDATE todo
                SET category = '${category}';`;
            await db.run(updateQuery);
            response.send("Category Updated");
      break;
      }
      else {
          response.status(400);
          response.send("Invalid Todo Category");
      }
    case updateDueDate(request.body):
      const { dueDate } = request.body;
      updateQuery = `
                UPDATE todo
                SET due_date = '${dueDate}';`;
      await db.run(updateQuery);
      response.send("Due Date Updated");
      break;
    default:
      const { todo } = request.body;
      updateQuery = `
                UPDATE todo
                SET todo = '${todo}';`;
      await db.run(updateQuery);
      response.send("Todo Updated");
      break;
  }
});

//API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
            DELETE FROM todo
            WHERE id = ${todoId};`;
  const responseDB = await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
