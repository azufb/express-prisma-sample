import express from 'express';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = new PrismaClient();

const app = express();
const port: number = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// 型定義（スキーマ定義）
const typeDefs = `
  type Task {
    id: Int
    title: String
    deadline: String
  }

  type Query {
    hello: String
    goodbye: String
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
    // 「こんにちは、あるいはこんばんは、エージェント黄昏くん。」と返してもらう
    hello: () => 'こんにちは、あるいはこんばんは、エージェント黄昏くん。',
    // 「バイバイ！」と返してもらう
    goodbye: () => 'バイバイ！',
    // タスク全部取得
    getTasks: () => prisma.task.findMany(),
  },
  Mutation: {
    // タスク登録
    addTask: (parent: any, args: any) => {
      return prisma.task.create({
        data: {
          title: args.title,
          deadline: args.deadline,
        },
      });
    },

    // タスク削除
    deleteTask: (parent: any, args: any) => {
      return prisma.task.delete({
        where: {
          id: args.id,
        },
      });
    },

    // タスク更新
    updateTask: (parent: any, args: any) => {
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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// サーバ起動
await new Promise<void>((resolve) => app.listen({ port: port }, resolve));
console.log(`🚀 Server ready at http://localhost:${port}/`);
