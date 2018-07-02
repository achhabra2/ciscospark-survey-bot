import { sparkbot } from 'botkit'
import redisStorage from 'botkit-storage-redis'
import botkitStoragePostgres from 'botkit-storage-postgres'
import promisify, { callbacks } from 'promisify-node'
import args from 'promisify-node/utils/args'

// Promisify determines if a function can be turned into a promise
// using the name of the last argument to the method. If it's named like a
// callback, assume its a callback. This works for everything except for
// the `all` method of `botkit-storage-redis`, which has a signature of
// `all(cb, options)`. To make this promisify-able, we take advantage of
// being able to pass in a "test" function and check whether either of the last
// two arguments is callback-like.
const promisifyHack = exports =>
  callbacks.indexOf(args(exports).slice(-2)[0]) > -1 ||
  callbacks.indexOf(args(exports).slice(-1)[0]) > -1

let db_user = process.env.db_user
let db_pass = process.env.db_pass
let db_host = process.env.db_host
let db_port = process.env.db_port
let db_db = process.env.db_db

if (process.env.DATABASE_URL) {
  // Heroku configuration, override the other db vars
  let match = process.env.DATABASE_URL.match(
    /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/i
  )
  db_user = match[1]
  db_pass = match[2]
  db_host = match[3]
  db_port = match[4]
  db_db = match[5]
}

const controller = sparkbot({
  debug: true,
  log: true,
  public_address: process.env.PUBLIC_ADDRESS || 'https://example.com',
  ciscospark_access_token: process.env.ACCESS_TOKEN || 'token',
  secret:
    process.env.SPARK_SECRET ||
    Math.random()
      .toString(36)
      .substr(2),
  studio_token: process.env.STUDIO_TOKEN,
  storage: botkitStoragePostgres({
    host: db_host,
    user: db_user,
    password: db_pass,
    port: db_port,
    database: 'botkit'
  }),
  limit_to_org: process.env.LIMIT_TO_ORG || null,
  limit_to_domain:
    (process.env.LIMIT_TO_DOMAIN && process.env.LIMIT_TO_DOMAIN.split(' ')) ||
    null
})

export default controller
