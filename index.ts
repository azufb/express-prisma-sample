import express from 'express';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = new PrismaClient();

const app = express();
const port: number = 8000;

// 型定義（スキーマ定義）
const typeDefs = `
  type Task {
    id: Int
    title: String
    deadLine: String
  }

  type Query {
    hello: String
    goodbye: String
  }
`;

// GraphQLにどういう処理をするか指示する
const resolvers = {
  Query: {
    // 「こんにちは、あるいはこんばんは、エージェント黄昏くん。」と返してもらう
    hello: () => 'こんにちは、あるいはこんばんは、エージェント黄昏くん。',
    // 「バイバイ！」と返してもらう
    goodbye: () => 'バイバイ！',
  },
};

// ApolloServer初期化
const server = new ApolloServer<BaseContext>({
  typeDefs,
  resolvers,
});

// ApolloServer起動
await server.start();

// Expressのミドルウェア設定
app.use(
  '/api',
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server)
);

// サーバ起動
await new Promise<void>((resolve) => app.listen({ port: port }, resolve));
console.log(`🚀 Server ready at http://localhost:${port}/`);
