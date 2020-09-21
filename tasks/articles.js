const {mapArticle} = require('../util');
let articleCollection;

async function articlesTask(connection) {
  await connection.get().dropCollection('article');
  articleCollection = await connection.get().collection('article');

  await example5();
  await example6();
  await example7();
  await example8();
  await example9();
}


// #### Articles

// Create 5 articles per each type (a, b, c)
async function example5() {
  try {
    const types = ['a', 'b', 'c'];

    const articles = Array.from({length: 5}).fill(types).flat()
      .map(char => ({type: char}))
      .map(mapArticle);
    const {result} = await articleCollection.insertMany(articles);
    console.log(`Added ${result.n} articles `);
  } catch (err) {
    console.error(err);
  }
}

// Find articles with type a, and update tag list
// with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function example6() {
  try {
    const tags = ['tag1-a', 'tag2-a', 'tag3'];

    const {result} = await articleCollection.updateMany(
      {type: 'a'},
      {
        $set: {tags: tags}
      });

    console.log(`Updated ${result.nModified} articles, [‘tag1-a’, ‘tag2-a’, ‘tag3’]`);
  } catch (err) {
    console.error(err);
  }
}


// Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles
// except articles from type a
async function example7() {
  try {
    const tags = ['tag2', 'tag3', 'super'];

    const {result} = await articleCollection.updateMany(
      {type: {$ne: 'a'}},
      {
        $set: {tags: tags}
      });

    console.log(`Updated ${result.nModified} articles, add tags [‘tag2’, ‘tag3’, ‘super’]`);
  } catch (err) {
    console.error(err);
  }
}


// Find all articles that contains tags [tag2, tag1-a]
async function example8() {
  try {
    const find = {$or: [{tags: 'tag2'}, {tags: 'tag1-a'}]};
    const projection = {name: 1, _id: 0};
    const articles = await articleCollection.find(find, projection).toArray();
    console.log('Articles: ');
    articles.forEach(console.log);
  } catch (err) {
    console.error(err);
  }
}


// Pull [tag2, tag1-a] from all articles
async function example9() {
  try {
    const update = {$pull: {tags: {$in: ['tag2', 'tag1-a']}}};
    const {result} = await articleCollection.updateMany({}, update);
    console.log(`Updated ${result.nModified} articles, pulled tags [‘tag2’, ‘tag1-a’]`);
  } catch (err) {
    console.error(err);
  }
}


module.exports = articlesTask;
