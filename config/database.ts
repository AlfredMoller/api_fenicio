// import { typeConfig } from '@japa/runner'
/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import type { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  connection: Env.get('DB_CONNECTION'),

  connections: {
    /*
    |--------------------------------------------------------------------------
    | MySQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for MySQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i mysql2
    |
    */
    mysql: {
      client: 'mysql',
      connection: {
        host: Env.get('MYSQL_HOST'),
        port: Env.get('MYSQL_PORT'),
        user: Env.get('MYSQL_USER'),
        password: Env.get('MYSQL_PASSWORD', ''),
        database: Env.get('MYSQL_DB_NAME'),
      },
      healthCheck: false,
      debug: false,
      pool: { min: 0, max: 7 },
      asyncStackTraces: false,
    },

    sybase: {
      client: 'sybase',
      connection: {
        host: Env.get('SYBASE_HOST'),
        port: Env.get('SYBASE_PORT'),
        user: Env.get('SYBASE_USER'),
        password: Env.get('SYBASE_PASSWORD', ''),
        database: Env.get('SYBASE_SERVERNAME'),
        servername: Env.get('SYBASE_SERVERNAME'),
      },

      healthCheck: true,
      debug: false,
      pool: { min: 0, max: 7, propagateCreateError: true, acquireTimeoutMillis: 1000 },
      asyncStackTraces: false,
    },
  },
}

export default databaseConfig
