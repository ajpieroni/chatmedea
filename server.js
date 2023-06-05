import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from "path";
import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyFormBody from "@fastify/formbody";
import fastifyView from "@fastify/view";
import handlebars from "handlebars";
import fetch from "node-fetch";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const fastifyInstance = fastify({
  logger: false,
});

fastifyInstance.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastifyInstance.register(fastifyFormBody);

fastifyInstance.register(fastifyView, {
  engine: {
    handlebars: handlebars,
  },
});

const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

fastifyInstance.get("/", function (request, reply) {
  console.log("We're in get!");
  const params = {
    seo: seo,
    key: process.env.huggingfaceKey,
  };
  // console.log("query", request.query);
  // console.log("body", request.body);
  // console.log("params", request.params);
  
  return reply.view("/src/pages/index.hbs", params); //return content of index.hbs
});

fastifyInstance.all("/query", async function (request, reply) {
  console.log("We're in post!");

  let params = { seo: seo };
  try {
    let data = await request.body;
    const response = await fetch(
      "https://api-inference.huggingface.co/models/ajpieroni/DiabloGPT-medium-medea",
      {
        headers: {
          Authorization: `Bearer ${process.env.huggingfaceKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    console.log("result: ", result);
    return result;
    
  } catch (error) {
    console.log(error);
    return reply.code(500).send("Internal Server Error");
  }
});

fastifyInstance.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
