const fastify = require("fastify");
const betterSqlite3 = require("better-sqlite3");
const rndm = require("rndm");

const chars =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
const generateCode = rndm.create(chars);

const db = betterSqlite3("archive.sqlite");
db.prepare(
  "CREATE TABLE IF NOT EXISTS urls ( id INTEGER PRIMARY KEY, url TEXT NOT NULL, code TEXT NOT NULL, hits INTEGER NOT NULL)"
).run();
const queryByUrl = db.prepare("SELECT * from urls WHERE url = ?");
const queryByCode = db.prepare("SELECT * from urls WHERE code = ?");
const insert = db.prepare(
  "INSERT INTO urls (url, code, hits) VALUES (?, ?, 0)"
);
const addHit = db.prepare("UPDATE urls SET hits = hits + 1 WHERE code = ?");
const deleteByCode = db.prepare("DELETE FROM urls WHERE code = ?");

const queryArchive = db.prepare("SELECT * from urls");

const BASEURL = process.env.BASEURL || 'http://localhost:3000';
const domainRegex = new RegExp(`^https:\/\/(www\.)?${process.env.MAIN_DOMAIN}`, "i");
const app = fastify();
app.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

app.register(require("@fastify/formbody"));

app.get("/", (request, reply) => {
  return reply.view("/src/home");
});

app.get("/archive", (request, reply) => {
  const archive = queryArchive.all();
  return reply.view("src/archive", { archive, baseurl: process.env.BASE_URL });
});

app.post("/", (request, reply) => {
  if (request.headers["content-type"] !== "application/x-www-form-urlencoded") {
    reply.code = 400;
    return "Bad Request incorrect content-type";
  }
  if (!domainRegex.test(request.body.url)) {
    reply.code = 400;
    return "Bad Request incorrect domain";
  }

  const code = generateCode(6);
  const codeHit = queryByCode.get(code);
  const urlHit = queryByUrl.get(request.body.url);
  if (codeHit === undefined && urlHit === undefined) {
    insert.run(request.body.url, code);
    reply.view("src/success", { code, baseurl: process.env.BASE_URL });
  }

  if (urlHit) {
    return reply.view("/src/repeaturl", { data: urlHit, baseurl: process.env.BASE_URL });
  }
});

app.delete("/:code", (request, reply) => {
  if (request.body === process.env.AUTH) {
    reply.code = 200;
    deleteByCode.run(request.params.code);
    return 'ok';
  }
  reply.code(400);
  return 'bad request';
});

app.get("/:code", async (request, reply) => {
  const result = queryByCode.get(request.params.code);
  addHit.run(request.params.code);
  return reply.view("/src/hit", { url: result.url });
});

app.listen({ port: 3000 });

console.log(`app running on http://localhost:3000`);
