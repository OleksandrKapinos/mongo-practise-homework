const {mapUser, getRandomFirstName} = require('../util');

let userCollection;

async function usersTask(connection) {
  // await connection.get().dropCollection('users');
  userCollection = await connection.get().collection('users');

  await example1();
  await example2();
  await example3();
  await example4();
}


// #### Users

// - Create 2 users per department (a, b, c)
async function example1() {
  try {
    const users = ['a', 'a', 'b', 'b', 'c', 'c']
      .map(char => ({department: char}))
      .map(mapUser);

    const {result} = await userCollection.insertMany(users);
    console.log(`Add ${result.n} user`);

  } catch (err) {
    console.error(err);
  }
}

// - Delete 1 user from department (a)
async function example2() {
  try {
    const {result} = await userCollection.deleteOne({department: 'a'});
    console.log(`Removed ${result.n} user`);
  } catch (err) {
    console.error(err);
  }
}

// - Update firstName for users from department (b)
async function example3() {
  try {
    const usersB = await userCollection.find({department: 'b'}).toArray();
    const bulkWrite = usersB.map(user => ({
      updateOne: {
        filter: {_id: user._id},
        update: {$set: {firstName: getRandomFirstName()}}
      }
    }));
    const {result} = await userCollection.bulkWrite(bulkWrite);
    console.log(`Updated ${result.nModified} users`);
  } catch (err) {
    console.error(err);
  }
}

// - Find all users from department (c)
async function example4() {
  try {
    const [find, projection] = [{department: 'c'}, {firstName: 1, _id: 0}];
    const users = await userCollection.find(find, projection).toArray();
    console.log('Users: ');
    users.forEach(console.log);
  } catch (err) {
    console.error(err);
  }
}


module.exports = usersTask;
