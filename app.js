const MongoClient = require("mongodb").MongoClient;

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "Test";

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true }, async function(
  err,
  client
) {
  const db = client.db(dbName);
  const users = db.collection("users");
  const articles = db.collection("articles");
  const students = db.collection("students");

  console.log("works :)");
  /* Rewriting lecture tasks in JS */

  // TASK 1: USERS
  users
    .bulkWrite([
      {
        // MAYBE BAD INSERTION OF VALUES INTO DB, BUT DIDN'T WANTED TO SET IT ALL IN JS
        insertMany: [
          {
            firstName: Math.random(),
            lastName: "Rayan",
            department: "a",
            createdAt: new Date()
          },
          {
            firstName: Math.random(),
            lastName: "Rayan",
            department: "a",
            createdAt: new Date()
          },
          {
            firstName: Math.random(),
            lastName: "Rayan",
            department: "b",
            createdAt: new Date()
          },
          {
            firstName: Math.random(),
            lastName: "Rayan",
            department: "b",
            createdAt: new Date()
          },
          {
            firstName: Math.random(),
            lastName: "Rayan",
            department: "c",
            createdAt: new Date()
          },
          {
            firstName: Math.random(),
            lastName: "Rayan",
            department: "c",
            createdAt: new Date()
          }
        ]
      },
      { deleteOne: { filter: { department: "a" } } },
      {
        updateMany: {
          filter: { department: "b" },
          update: { $set: { firstName: "UsersFromB" } }
        }
      }
    ])
    .catch(err => console.log(err));

  users.find({ department: "c" }).forEach(item => console.log(item));

  // TASK 2:
  articles.bulkWrite([
    {
      insertMany: [
        {
          name: Math.random(),
          description: Math.random(),
          type: "a",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "a",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "a",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "a",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "a",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "b",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "b",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "b",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "b",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "b",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "c",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "c",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "c",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "c",
          tags: []
        },
        {
          name: Math.random(),
          description: Math.random(),
          type: "c",
          tags: []
        }
      ]
    },
    {
      updateMany: {
        filter: { type: "a" },
        update: { $push: { tags: { $each: ["tag1-a", "tag2-a", "tag3"] } } }
      }
    },
    {
      updateMany: {
        filter: { type: { $ne: "a" } },
        update: { $push: { tags: { $each: ["tag2", "tag3", "super"] } } }
      }
    },
    {
      updateMany: {
        filter: {},
        update: { $pull: { tags: { $in: ["tag1-a", "tag2"] } } }
      }
    }
  ]);

  //TASK 3: STUDENTS TASK

  students
    .find()
    .sort({ "scores.2.score": -1 })
    .forEach(item =>
      console.log(item.name + "has homework score = " + item.scores[2].score)
    );

  // AS I UNDERSTOOD IN THE TOP SHOULD BE THE WORST QUIZ SCORES, AND THE BEST HOMEWORK
  students
    .find()
    .sort({ "scores.1.score": 1, "scores.2.score": -1 })
    .forEach(item =>
      console.log(
        item.name +
          " quiz score " +
          item.scores[1].score +
          " has homework score = " +
          item.scores[2].score
      )
    );

  students
    .find()
    .sort({ "scores.0.score": -1, "scores.1.score": -1 })
    .forEach(item =>
      console.log(
        item.name +
          "has exam score " +
          item.scores[0].score +
          " has quiz score = " +
          item.scores[1].score
      )
    );

  students.updateMany(
    { "scores.1.score": { $gte: 80 } },
    { $set: { goodQuizer: true } }
  );

  students.deleteMany({ "scores.2.score": { $lte: 60 } });

  // GETTING THE AVERANGE HOMEWORK SCORE
  students
    .aggregate([
      { $unwind: { path: "$scores", includeArrayIndex: "NamedIndex" } },
      { $match: { NamedIndex: 2 } },
      {
        $group: {
          _id: "Avarage homework",
          avgAmm: { $avg: "$scores.score" }
        }
      }
    ])
    .forEach(item => console.log("The average homework score: " + item.avgAmm));

  // ADDITIONAL TASK

  students
    .aggregate([
      // SEPARATING ARRAY INTO FLAT VALUES
      { $unwind: { path: "$scores" } },

      // GROUP THOSE FLAT VALUES (STUDENT MARKS FOR: EXAM, QUIZ, HOMEWORK) IN ONE OBJECT BY STUDENT ID
      {
        $group: {
          _id: "$_id",
          avgAmm: { $avg: "$scores.score" },
          name: { $first: "$name" }
        }
      },

      // ADDING EACH USER FIELD THAT DESCRIBES IN WHICH GROUP STUDENT SHOULD BE DEPEND ON HIS AVG MARKS
      {
        $project: {
          name: true,
          avgAmm: true,
          studGroup: {
            $switch: {
              branches: [
                { case: { $gt: ["$avgAmm", 60] }, then: "c" },
                { case: { $lt: ["$avgAmm", 40] }, then: "a" }
              ],
              default: "b"
            }
          }
        }
      },

      // GROUP STUDENTS BY THEIR GROUP (A,B,C) AND PUSHING NAMES INTO A,B,C GROUPS ARRAY
      { $group: { _id: "$studGroup", studentsOfGroup: { $push: "$name" } } }
    ]) // CONSOLE LOGING GROUPS AND STUDENTS WHICH ARE IN THEM
    .forEach(item =>
      console.log(
        `
        Group ${item._id} contains those students: ${item.studentsOfGroup}
        `
      )
    );
});
