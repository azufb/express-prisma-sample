import express from 'express';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port: number = 8000;

// 型定義（スキーマ定義）
const typeDefs = `
  type Todo {
    id: Int
    title: String
  }

  type TodoInput {
    title: String
  }

  type Query {
    hello: String
    goodbye: String
    todos: [Todo]
  }

  type Mutation {
    addTodo(todo: String): [Todo]
  }
`;

const todos = [
  {
    id: 1,
    title: '朝ごはんを食べる',
  },
  {
    id: 2,
    title: '昼ごはんを食べる',
  },
];

// GraphQLにどういう処理をするか指示する
const resolvers = {
  Query: {
    // 「こんにちは、あるいはこんばんは、エージェント黄昏くん。」と返してもらう
    hello: () => 'こんにちは、あるいはこんばんは、エージェント黄昏くん。',
    // 「バイバイ！」と返してもらう
    goodbye: () => 'バイバイ！',
    // 定義したtodosを取得する
    todos: () => todos,
  },
  Mutation: {
    // todosにデータを追加
    addTodo: (parent: any, args: any) => {
      const newData = {
        id: 0,
        title: args.todo,
      };
      todos.push(newData);
      return todos;
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
  '/',
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server)
);

// サーバ起動
await new Promise<void>((resolve) => app.listen({ port: port }, resolve));
console.log(`🚀 Server ready at http://localhost:${port}/`);
