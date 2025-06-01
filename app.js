const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// MySQL 연결 설정
const db = mysql.createPool({
  host: 'localhost',
  user: 'root', // 사용자 이름
  password: 'jin76061755!!', // 비밀번호
  database: 'login_db',
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
  })
);

app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(
      `<h2>환영합니다, ${req.session.user.username}님!</h2><a href="/logout">로그아웃</a>`
    );
  } else {
    res.redirect('/login.html');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log(username);
  console.log(password);
  const bcrypt = require('bcrypt');
  bcrypt.hash(password, 10).then(console.log);
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [
      username,
    ]);

    if (rows.length === 0) {
      return res.send('존재하지 않는 사용자입니다.');
    }
    console.log(rows[0]);
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send('비밀번호가 틀렸습니다.');
    }

    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
