import { Elysia, t } from "elysia";
import { Database } from "bun:sqlite";
import rndm from "rndm";
import { html } from "@elysiajs/html";
import Form from "./Form";
import Layout from "./Layout";
import ArchiveList from "./ArchiveList";

type Result = {
  url: string;
  code: string;
  hits: number;
};

const app = new Elysia();
const db = new Database("archive.sqlite", { create: true });
const chars =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
const generateCode = rndm.create(chars);

db.run(
  "CREATE TABLE IF NOT EXISTS urls ( id INTEGER PRIMARY KEY, url TEXT NOT NULL, code TEXT NOT NULL, hits INTEGER NOT NULL)"
);
const queryByUrl = db.query("SELECT * from urls WHERE url = ?");
const queryByCode = db.query("SELECT * from urls WHERE code = ?");
const insert = db.prepare(
  "INSERT INTO urls (url, code, hits) VALUES ($url, $code, 0)"
);
const addHit = db.prepare("UPDATE urls SET hits = hits + 1 WHERE code = ?");

const queryArchive = db.query("SELECT * from urls");

app.use(html());
app.get("/", () => {
  return (
    <Layout>
      <Form />
    </Layout>
  );
});

app.get("/archive", () => {
  const results: Result[] = queryArchive.all() as Result[];
  return (
    <Layout>
      <ArchiveList data={results} />
    </Layout>
  );
});

app.post(
  "/",
  async ({ body, request, set }) => {
    if (
      request.headers.get("Content-Type") !==
      "application/x-www-form-urlencoded"
    ) {
      set.status = 400;
      return "Bad Request incorrect content-type";
    }
    if (!/^https:\/\/(www\.)?bostonfirearms.com/i.test(body.url)) {
      set.status = 400;
      return "Bad Request incorrect domain";
    }
    const code = generateCode(6);
    const codeHit = queryByCode.get(code);
    const urlHit = queryByUrl.get(body.url);
    if (codeHit === null && urlHit === null) {
      insert.run(body.url, code);
      const result: Result = queryByCode.get(code) as Result;
      return (
        <html lang="en">
          <body>
            <h1>Boston firearms url shortener</h1>
            <div>Success!</div>
            <p>{`https://bosfirearms.com/${result.code}`}</p>
            <Form />
          </body>
        </html>
      );
    }
  },
  {
    body: t.Object({
      url: t.String(),
    }),
  }
);

app.get("/:code", async ({ params }) => {
  const result: Result = queryByCode.get(params.code) as Result;
  addHit.run(params.code);
  return result !== null ? (
    <html lang="en">
      <head>
        <meta http-equiv="refresh" content={`0;url=${result.url}`} />
        <title>Redirecting...</title>
      </head>
      <body>
        <p>
          If you are not redirected, <a href={result.url}>click here</a>.
        </p>
      </body>
    </html>
  ) : (
    ""
  );
});

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
