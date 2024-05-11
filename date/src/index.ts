import Fastify from "fastify";
import * as dayjs from 'dayjs';
import * as CustomParseFormat from 'dayjs/plugin/customParseFormat.js';

const loggerEnv = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname,time',
      },
    },
  },
  production: true,
  test: false,
}

const date = dayjs.default();

const fastify = Fastify({
  logger: (process.env.NODE_ENV != "production" ? loggerEnv.development : loggerEnv.production),
  trustProxy: Boolean(process.env.IS_BEHIND_PROXY),
});

fastify.post('/date', {
  schema: {
    body: {
      type: "object",
      required: ["date", "to"],

      properties: {
        date: { type: "string" },
        to: { type: "string" }
      },
    },
  },
}, async (req, res) => {
  // @ts-expect-error: fastify route schema parsing is trustworthy, so we can assume invalid types
  const body: {
    date: string,
    to: string,
  } = req.body;

  return {
    date: date_parse(body)
  }
})

fastify.get("/date", {
  schema: {
    querystring: {
      type: "object",
      properties: {
        date: { type: "string" },
        to: { type: "string" },
      },
    },
  }
}, async (req, res) => {
  // @ts-expect-error: fastify route schema parsing is trustworthy, so we can assume invalid types
  const query: {
    date: string,
    to: string
  } = req.query;
  return {
    date: date_parse(query)
  };
})

try {
  await fastify.listen({
    port: 41205,
    host: process.env.NODE_ENV == "production" ? "0.0.0.0" : "127.0.0.1"
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1)
}

function date_parse(body: { date: string; to: string; }) {
  let date;
  try {
    date = dayjs.default(body.date);
  } catch (err) {
    dayjs.extend(CustomParseFormat.default);
    date = dayjs.default(body.date, ["YYYY-MM-DD", "YYYY MM DD", "YYYY/MM/DD", "MM/DD/YYYY", "M/D/YYYY"]);
  }
  return date.format(body.to);
}
