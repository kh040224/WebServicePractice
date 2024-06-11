//
const path = require('path')

// Express 모듈을 불러옵니다.
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = 'sdfkandkfnaenolqawoireqpnskf';

// Express 애플리케이션을 생성합니다.
const app = express();

//
app.use('/static', express.static(path.join(__dirname, 'public')));

// 기본 포트를 설정하거나 3000 포트를 사용합니다.
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === 'OPTIONS') {
      res.sendStatus(200);
  } else {
      next();
  }
});

// 로깅 미들웨어
const logginMiddleware =(req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // 다음 미들웨어로 요청을 전달
};

const sessionAuthMiddleware = (req, res, next) => {
  if (req.session.user) {
    console.log(req.session.user)
    next();
  } else {
    res.status(401).send('인증되지 않은 사용자입니다.');
  }
};

const tokenAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];

  if (!authHeader || !token) {
    return res.status(403).send('비정상 접근입니다.');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send('정상적이지 않은 토큰입니다.');
  }
  next();
};

app.use(session({
  secret: 'kh',
  resave: false,
  saveUninitialized: false,
}));
app.use(bodyParser.json())

const users = [
  {id: "hong", name: '홍길동', pwd: '1234'},
  {id: "kim", name: '김길동', pwd: '1234'},
  {id: "so", name: '소길동', pwd: '1234'},
  {id: "na", name: '나길동', pwd: '1234'},
];

app.post('/session/login', logginMiddleware, (req, res) => { 
  const { id, pwd } = req.body;
  const user = users.find(user => user.id === id && user.pwd === pwd);

  if (user) {
    req.session.user = {id: user.id, name: user.name};
    res.send('로그인 성공');
  } else {
    res.status(401).send('로그인 실패');
  }
});

app.get('/session/logout', (req, res) => {
  req.session.destroy();
  res.send('로그아웃 성공');
});

app.get('/', (req, res) => {
  res.send('Hello, Express.js!');
});

app.get('/user', tokenAuthMiddleware, (req, res) => {
  const { id } = req.query;

  if(id) {
    const resultUser = users.find((userData) => {
      return userData.id === id
    });

    if(resultUser) {
      res.send(resultUser);
    } else {
      res.status(400).send("해당 사용자를 찾을 수 없습니다");
    }
  } else {
    res.send(users)
  }
});

app.post('/token/login', (req, res) => {
  const { id, pwd } = req.body;
  const user = users.find(user => user.id === id && user.pwd === pwd);
  if (user) {
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, userName:user.name });
  } else {
    res.status(401).send('로그인 실패');
  }
});

// JSON 파싱을 위한 미들웨어
app.use(express.json());

// 서버를 설정한 포트에서 실행합니다.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});