const express: any = require('express');
const app: any = express();
const port: number = 8000;

app.get('/', (req: any, res: any) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Look at http://localhost:${port}/`);
});
