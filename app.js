'use strict';

const {mapArticle} = require('./util');
const userTask = require('./tasks/users');
const articlesTask = require('./tasks/articles');
const studentsTask = require('./tasks/students');

// db connection and settings
const connection = require('./config/connection');
run();

async function run() {
  await connection.connect();

  await userTask(connection);
  await articlesTask(connection);
  await studentsTask(connection);

  await connection.close();
}



