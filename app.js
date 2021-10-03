var express = require("express");
var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");

let fakeDB = {};

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
    input MessageInput{
        content: String
        author: String!
    }

    type Message{
        id: ID!
        content: String
        author: String
    }

    type Query{
        getMessages:[Message]
        getMessage(id: ID!):Message
    }

    type Mutation{
        createMessage(input: MessageInput):Message
        updateMessage(id:ID!, message: MessageInput):Message 
    }
`);

class Message {
  constructor(id, { content, author }) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

// The root provides a resolver function for each API endpoint
var root = {
  getMessages: ({ id }) => {
    let messages = [];
    for (messageId in fakeDB) {
      messages.push(new Message(messageId, fakeDB[messageId]));
    }
    return messages;
  },
  getMessage: ({ id }) => {
    if (!fakeDB[id]) {
      throw new Error("message is not exist");
    }
    return new Message(id, fakeDB[id]);
  },
  createMessage({ input }) {
    let id = require("crypto").randomBytes(10).toString("hex");
    fakeDB[id] = input;
    return new Message(id, input);
  },
  updateMessage({ id, input }) {
    if (!fakeDB[id]) {
      throw new Error("message is not exist");
    }
    fakeDB[id] = input;
    return new Message(id, input);
  },
};

var app = express();

app.use(express.static("public"));

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
