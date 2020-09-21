const fs = require('fs');
let studentCollection;
const worstScore = 40;
const bestScore = 80;


async function studentsTask(connection) {
  // await connection.get().dropCollection('students');
  studentCollection = await connection.get().collection('students');

  await example10();
  await example11();
  await example12();
  await example13();
  await example14();
  await example15();
  await example16();
}


//Find all students who have the worst score for homework, sort by descent
async function example10() {
  try {
    const pipeline = [
      {$unwind: '$scores'},
      {
        $match: {
          'scores.type': 'homework',
          'scores.score': {$lt: worstScore}
        }
      },
      {$sort: {'scores.score': -1}}
    ];


    const students = await studentCollection.aggregate(pipeline).toArray();
    console.log('Find all students who have the worst score for homework, sort by descent', students);
  } catch (err) {
    console.error(err);
  }
}


//Find all students who have the best score for quiz and the worst for homework, sort by ascending
async function example11() {
  try {
    const pipeline = [
      {
        $match: {
          $and: [
            {
              'scores': {
                '$elemMatch': {
                  'type': 'homework',
                  'score': {$lt: worstScore}
                }
              }
            },
            {
              'scores': {
                '$elemMatch': {
                  'type': 'quiz',
                  'score': {$gt: bestScore}
                }
              }
            }
          ]
        }
      },
      {$sort: {'scores.score': 1}}
    ];


    const students = await studentCollection.aggregate(pipeline).toArray();
    console.log('Find all students who have the best score for quiz and the worst for homework, sort by ascending',
      students);
  } catch (err) {
    console.error(err);
  }
}


//Find all students who have best scope for quiz and exam
async function example12() {
  try {
    const pipeline = [
      {
        $match: {
          $and: [
            {
              'scores': {
                '$elemMatch': {
                  'type': 'quiz',
                  'score': {$gt: bestScore}
                }
              }
            },
            {
              'scores': {
                '$elemMatch': {
                  'type': 'exam',
                  'score': {$gt: bestScore}
                }
              }
            }
          ]
        }
      }
    ];

    const students = await studentCollection.aggregate(pipeline).toArray();
    console.log('Find all students who have best scope for quiz and exam ', students);
  } catch (err) {
    console.error(err);
  }
}


//Calculate the average score for homework for all students
async function example13() {
  try {
    const pipeline = [
      {$unwind: '$scores'},
      {
        $match: {
          'scores.type': 'homework'
        }
      },
      {$group: {_id: 'homework-count', count: {$sum: '$scores.score'}}}
    ];
    const students = await studentCollection.aggregate(pipeline).toArray();


    console.log('Calculate the average score for homework for all students', students);
  } catch (err) {
    console.error(err);
  }
}


//Delete all students that have homework score <= 60
async function example14() {
  try {
    const find = {scores: {$elemMatch: {type: 'homework', score: {$lt: 60}}}};
    const {result} = await studentCollection.deleteMany(find).toArray();


    console.log('Delete all students that have homework score <= 60');
    console.log(`Removed ${result.n} students`);

  } catch (err) {
    console.error(err);
  }
}


// Mark students that have quiz score => 80
async function example15() {
  try {
    const find = {scores: {$elemMatch: {type: 'quiz', score: {$gte: 80}}}};
    const update = {$set: {marked: true}};
    let {result} = await studentCollection.updateMany(find, update);

    console.log('Mark students that have quiz score => 80');
    console.log(`Updated ${result.nModified} students`);
  } catch (err) {
    console.error(err);
  }
}


//Write a query that group students by 3 categories (calculate the average grade for three subjects)
//   - a => (between 0 and 40)
//   - b => (between 40 and 60)
//   - c => (between 60 and 100)
async function example16() {
  try {
    const pipeline = [
      {
        $project: {
          '_id': 0,
          'name': 1,
          'averageGrade': {$avg: '$scores.score'}
        }
      },
      {
        $project: {
          '_id': 0,
          'name': 1,
          'averageGrade': 1,
          'group': {
            $cond: {
              if: {
                $lt: ['$averageGrade', worstScore]
              },
              then: 'a',
              else: {
                $cond: {
                  if: {
                    $and: [
                      {$gte: ['$averageGrade', worstScore]},
                      {$lt: ['$averageGrade', bestScore]}
                    ]
                  },
                  then: 'b',
                  else: 'c'
                }
              }
            }
          }
        }
      },
      {
        $group: {_id: '$group', students: {$push: '$name'}}
      }
    ];

    const students = await studentCollection.aggregate(pipeline).toArray();

    console.log('Calculate the average grade for three subjects ', students);
  } catch (err){
    console.error(err);
  }
}


module.exports = studentsTask;

