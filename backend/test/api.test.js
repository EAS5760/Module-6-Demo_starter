// Route-level tests with stubbed models: no Atlas connection is made.
const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.JWT_SECRET = 'test-only-secret-not-for-deployment';
process.env.JWT_EXPIRES_IN = '15m';
process.env.CORS_ENABLED = 'true';
process.env.FRONTEND_URL = 'http://localhost:5500';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../server');
const Task = require('../src/models/task');
const User = require('../src/models/user');

test('Demo HTTP behavior (database models stubbed)', async t => {
  const tasks = new Map();
  const users = new Map();
  let idCounter = 0;
  Task.create = async data => {
    const task = { _id: (++idCounter).toString(16).padStart(24, '0'), ...data };
    tasks.set(task._id, task); return task;
  };
  Task.find = async () => [...tasks.values()];
  Task.findById = async id => tasks.get(id) || null;
  Task.findByIdAndUpdate = async (id, update) => {
    const task = tasks.get(id); if (!task) return null;
    Object.assign(task, update.$set); return task;
  };
  Task.findByIdAndDelete = async id => {
    const task = tasks.get(id); tasks.delete(id); return task || null;
  };
  User.create = async data => {
    if (users.has(data.email)) throw Object.assign(new Error('duplicate'), { code: 11000 });
    const user = { _id: '123456789012345678901234', ...data };
    users.set(user.email, user); return user;
  };
  User.findOne = async query => users.get(query.email) || null;
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = (path, method = 'GET', body, headers = {}) => fetch(base + path, {
    method, headers: { ...(body === undefined ? {} : {'Content-Type':'application/json'}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  await t.test('Health and CORS header', async () => {
    const res = await send('/health', 'GET', undefined, { Origin: 'http://localhost:5500' });
    assert.equal(res.status, 200); assert.deepEqual(await res.json(), {status:'ok'});
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5500');
  });
  for (const [label, body] of [
    ['missing title', {}], ['blank title', {title:'   '}], ['numeric title', {title:123}],
    ['string boolean', {title:'Test',completed:'yes'}], ['long title', {title:'x'.repeat(101)}]
  ]) await t.test('POST rejects ' + label + ' before database writes', async () => {
    const res = await send('/tasks','POST',body); assert.equal(res.status,400);
    assert.ok((await res.json()).errors.length); assert.equal(tasks.size,0);
  });
  let taskId;
  await t.test('POST trims title and omits unknown fields', async () => {
    const res = await send('/tasks','POST',{title:'  Learn validation  ', completed:true, owner:'injected'});
    assert.equal(res.status,201); const data = await res.json(); taskId = data._id;
    assert.equal(data.title,'Learn validation'); assert.equal(data.completed,true);
    assert.equal(data.owner,undefined);
  });
  await t.test('PATCH rejects bad inputs without altering data', async () => {
    for (const body of [{}, {title:''}, {completed:'false'}]) {
      assert.equal((await send('/tasks/'+taskId,'PATCH',body)).status,400);
    }
    assert.equal(tasks.get(taskId).completed,true);
  });
  await t.test('PATCH preserves title and accepts boolean false', async () => {
    const res = await send('/tasks/'+taskId,'PATCH',{completed:false});
    assert.equal(res.status,200); const data = await res.json();
    assert.equal(data.title,'Learn validation'); assert.equal(data.completed,false);
  });
  const credentials = {email:'demo@example.com',password:'DemoPassword123!'};
  await t.test('Register hashes password and excludes hash from response', async () => {
    const res = await send('/register','POST',credentials); assert.equal(res.status,201);
    assert.equal((await res.json()).passwordHash,undefined);
    const stored = users.get(credentials.email);
    assert.notEqual(stored.passwordHash,credentials.password);
    assert.ok(await bcrypt.compare(credentials.password,stored.passwordHash));
    assert.equal((await send('/register','POST',credentials)).status,409);
  });
  let token;
  await t.test('Login signs token; wrong password rejected', async () => {
    assert.equal((await send('/login','POST',{...credentials,password:'WrongPassword123!'})).status,401);
    const res = await send('/login','POST',credentials); assert.equal(res.status,200);
    token = (await res.json()).token; assert.equal(jwt.verify(token,process.env.JWT_SECRET).userId,'123456789012345678901234');
  });
  await t.test('Protected route rejects missing, invalid, and expired tokens', async () => {
    assert.equal((await send('/tasks')).status,401);
    const expired = jwt.sign({userId:'123'},process.env.JWT_SECRET,{expiresIn:-1});
    for (const value of ['invalid-token', expired]) {
      assert.equal((await send('/tasks','GET',undefined,{Authorization:'Bearer '+value})).status,401);
    }
    assert.equal((await send('/tasks','GET',undefined,{Authorization:'Bearer '+token})).status,200);
  });
  await t.test('Safe comment encodes script markup', async () => {
    const res = await send('/comment','POST',{comment:'<script>alert("XSS demo")</script>'});
    const html = await res.text(); assert.equal(res.status,200);
    assert.ok(!html.includes('<script>')); assert.match(html, /(?:&lt;|&#x3c;|&#60;)script(?:&gt;|&#x3e;|&#62;)/i);
  });
  await t.test('Delete returns bodyless 204; later GET returns 404', async () => {
    const res = await send('/tasks/'+taskId,'DELETE');
    assert.equal(res.status,204); assert.equal(await res.text(),'');
    assert.equal((await send('/tasks/'+taskId)).status,404);
  });
});
