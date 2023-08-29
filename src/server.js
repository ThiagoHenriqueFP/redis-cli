#!/usr/bin/env node

const { createClient } = require("redis");
const { program } = require("commander");
const packageJson = require("../package.json");

program.version(packageJson.version);

var client;

(async () => {
  client = createClient();
  client.on("error", (err) => console.log(err));

  await client.connect();
})();

program
  .command("add [key] [value]")
  .description("add a record on redis, with key and value")
  .action(async (key, value) => {
    try {
      await client.set(key, value);
      var response = await client.get(key);
      console.log(`key: ${key}\nvalue: ${response}`);
    } catch (err) {
      console.log(err);
    }

    await closeClientRedis();
  });

program
  .command("get [key]")
  .description("get value from key")
  .action(async (key) => {
    try {
      var response = await client.get(key);
      console.log(`key: ${key}\nvalue: ${response}`);
    } catch (err) {
      console.log(err);
    }

    await closeClientRedis();
  });

program
  .command("get-all")
  .description("list all keys in database")
  .action(async () => {
    try {
      var response = await client.keys("*", (err, keys) => {
        if (err) return console.log(err);
        if (keys) {
          return keys;
        }
      });
    } catch (err) {
      console.log(err);
    }

    for (i of response) {
      console.log(i);
    }

    await closeClientRedis();
  });

program
  .command("get-all-values")
  .description("list all keys and values")
  .action(async () => {
    try {
      var response = await client.keys("*", async () => {
        if (err) {
          console.log(err);
          return;
        }

        if (keys) {
          return keys;
        }
      });

      let keys = [];
      let values = [];
      for (i of response) {
        keys.push(i);
        values.push(await client.get(i));
      }

      for (i in keys) {
        console.log(`[ ${keys[i]} - ${values[i]} ]`);
      }
    } catch (err) {
      console.log(err);
    }

    await closeClientRedis();
  });

program
  .command("remove [keys]")
  .description("remove an array of keys")
  .action(async (key) => {
    try {
      await client.del(key);
      console.log(`key removed - ${key}`);
    } catch (err) {
      console.log(err);
    }

    await closeClientRedis();
  });

program.parse(process.argv);

async function closeClientRedis() {
  await client.quit();
}
