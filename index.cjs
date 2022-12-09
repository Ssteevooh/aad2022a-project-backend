require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const db = require('./db.cjs');
const models = require('./models/index.cjs');
const typeDefs = require('./schema.cjs');
const resolvers = require('./resolvers/index.cjs');

const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');

const port = process.env.PORT || 7000;
const DB_HOST = process.env.DB_HOST;

const app = express();

app.use(helmet({
  contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? true : false,
  crossOriginEmbedderPolicy: (process.env.NODE_ENV === 'production') ? true : false
}));
app.use(cors());

db.connect(DB_HOST);

const getUser = token => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Session invalid');
    }
  }
};

async function startServer(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: ({ req }) => {
      const token = req.headers.authorization;
      const user = getUser(token);
      return { models, user };
    }

  });
  await server.start();
  server.applyMiddleware({ app, path: '/api' });
  return server.graphqlPath;
};

app.listen(port, async () => {
  const path = await startServer(app);
  console.log(`Graphql Server running at http://localhost:${port}${path}`)
});
