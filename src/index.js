const fastify = require("fastify");
const betterSqlite3 = require("better-sqlite3");
const rndm = require("rndm");

const chars =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
const generateCode = rndm.create(chars);

const db = betterSqlite3('archive.sqlite');
db.prepare(
  "CREATE TABLE IF NOT EXISTS urls ( id INTEGER PRIMARY KEY, url TEXT NOT NULL, code TEXT NOT NULL, hits INTEGER NOT NULL)"
).run();
const queryByUrl = db.prepare("SELECT * from urls WHERE url = ?");
const queryByCode = db.prepare("SELECT * from urls WHERE code = ?");
const insert = db.prepare(
  "INSERT INTO urls (url, code, hits) VALUES (?, ?, 0)"
);
const addHit = db.prepare("UPDATE urls SET hits = hits + 1 WHERE code = ?");

const queryArchive = db.prepare("SELECT * from urls");

const app = fastify();
app.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

app.register(require('@fastify/formbody'));

app.get("/", (request, reply) => {
  return reply.view('/src/home');
});

app.get("/archive", (request, reply) => {
  const archive = queryArchive.all();
  return reply.view('src/archive', { archive });
});

app.post(
  "/",
    (request, reply) => {
    if (
      request.headers["content-type"] !==
      "application/x-www-form-urlencoded"
    ) {
      reply.code = 400;
      return "Bad Request incorrect content-type";
    }
    if (!/^https:\/\/(www\.)?bostonfirearms.com/i.test(request.body.url)) {
      reply.code = 400;
      return "Bad Request incorrect domain";
    }

    console.log('pre code generation');
    const code = generateCode(6);
    const codeHit = queryByCode.get(code);
    const urlHit = queryByUrl.get(request.body.url);
    console.log(codeHit, urlHit);
    if (codeHit === undefined && urlHit === undefined) {
      console.log('pre insert')
      insert.run(request.body.url, code);
      console.log('inserted')
      reply.view('src/success', { code });
    }
  }
);

app.get("/:code", async (request, reply) => {
  const result = queryByCode.get(request.params.code);
  addHit.run(request.params.code);
  return reply.view('/src/hit', { url: result.url })
});

app.listen({ port: 3000 });

console.log(
  `app running on http://localhost:3000`
);
