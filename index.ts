import express from 'express';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

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

  type User {
    id: Int
    name: String
  }

  type SigninResult {
    code: Int
    message: String
  }

  type SignoutResult {
    code: Int
    targetUser: User
  }

  type Query {
    hello: String
    goodbye: String
    getTasks: [Task]
  }

  type Mutation {
    addTask(title: String, deadline: String): Task
    deleteTask(id: Int): Task
    searchSameEmailUser(email: String): [User]
    signup(name: String, email: String, password: String): User
    signin(email: String, password: String): SigninResult
    signout(id: Int, email: String): SignoutResult
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

    // 同じメールアドレスのユーザがいないか検索
    searchSameEmailUser: (parent: any, args: any) => {
      return prisma.user.findMany({
        where: {
          email: args.email,
        },
      });
    },

    // サインアップ
    signup: (parent: any, args: any) => {
      // ソルト生成
      const salt: string = crypto.randomBytes(16).toString('hex');
      // パスワードとソルトを合体
      const saltedPassword: string = args.password + salt;
      // パスワード+ソルトをハッシュ化
      const hashedPassword: string = crypto
        .createHash('sha256')
        .update(saltedPassword)
        .digest('hex');

      return prisma.user.create({
        data: {
          name: args.name,
          email: args.email,
          password: hashedPassword,
          salt: salt,
          isSignedin: true,
        },
      });
    },

    // サインイン
    signin: async (parent: any, args: any) => {
      let resultObj = {
        code: 0,
        message: '',
      };
      const uniqueUser = await prisma.user.findUnique({
        where: {
          email: args.email,
        },
        select: {
          email: true,
          password: true,
          salt: true,
        },
      });

      if (uniqueUser) {
        const password = uniqueUser.password;
        const salt = uniqueUser.salt;

        // 入力されたパスワード
        const inputPassword: string = args.password;
        // 入力されたパスワードとソルトを合体
        const saltedPassword: string = inputPassword + salt;
        // パスワード+ソルトをハッシュ化
        const hashedPassword = crypto
          .createHash('sha256')
          .update(saltedPassword)
          .digest('hex');

        if (hashedPassword === password) {
          // isSignedinをtrueにする
          await prisma.user.update({
            where: {
              email: uniqueUser.email,
            },
            data: {
              isSignedin: true,
            },
          });

          resultObj = {
            code: 200,
            message: 'Success',
          };
        } else {
          console.log('error');
          resultObj = {
            code: 401,
            message: 'Failed',
          };
        }
      } else {
        resultObj = {
          code: 404,
          message: 'user not found',
        };
      }
      return resultObj;
    },

    // サインアウト
    signout: async (parent: any, args: any) => {
      const uniqueUser = await prisma.user.findUnique({
        where: {
          email: args.email,
        },
      });

      if (uniqueUser) {
        await prisma.user.update({
          where: {
            id: uniqueUser.id,
            email: uniqueUser.email,
          },
          data: {
            isSignedin: false,
          },
        });

        const resultObj = {
          code: 200,
          targetUser: uniqueUser,
        };

        return resultObj;
      } else {
        const resultObj = {
          code: 400,
          targetUser: uniqueUser,
        };

        return resultObj;
      }
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
