import express from 'express';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = new PrismaClient();

const app = express();
const port: number = 8001;

const helloWorld: string = 'Hello World!';

const greetings: string[] = [
  'Hello!',
  '¡Hola!',
  'こんにちは!',
  '你好!',
  'bonjour!',
];

// ランダムな数字を返す
const getRandomValue = (max: number): number => {
  return Math.floor(Math.random() * max);
};

// 型定義（スキーマ定義）
const typeDefs = `
  type Task {
    id: Int
    title: String
    deadline: String
  }

  type Query {
    hello(name: String): String
    helloWorld: String
    greeting: String
    goodbye(name: String): String
    getTasks: [Task]
  }

  type Mutation {
    addTask(title: String, deadline: String): Task
    deleteTask(id: Int): Task
    updateTask(id: Int, title: String, deadline: String): Task
  }
`;

// GraphQLにどういう処理をするか指示する
const resolvers = {
  Query: {
    hello: (parent: any, args: { name: string }) => {
      return `Hello, ${args.name}!`;
    },
    helloWorld: () => helloWorld,
    // ランダムであいさつを返してもらう。
    greeting: () => {
      const max: number = greetings.length;
      console.log(getRandomValue(max));
      return greetings[getRandomValue(max)];
    },
    goodbye: (parent: any, args: any) => {
      return `バイバイ、${args.name}!`;
    },
    // タスク全部取得
    getTasks: () => prisma.task.findMany(),
  },
  Mutation: {
    // タスク登録
    addTask: (parent: any, args: { title: string; deadline: string }) => {
      return prisma.task.create({
        data: {
          title: args.title,
          deadline: args.deadline,
        },
      });
    },

    // タスク削除
    deleteTask: (parent: any, args: { id: number }) => {
      return prisma.task.delete({
        where: {
          id: args.id,
        },
      });
    },

    // タスク更新
    updateTask: (
      parent: any,
      args: { id: number; title: string; deadline: string }
    ) => {
      return prisma.task.update({
        where: {
          id: args.id,
        },
        data: {
          id: args.id,
          title: args.title,
          deadline: args.deadline,
        },
      });
    },
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
