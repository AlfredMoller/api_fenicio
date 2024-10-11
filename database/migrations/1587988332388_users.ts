import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {

  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments().primary()
      table.string('client_id', 255).notNullable()
      table.string('name', 180)
      table.string('codigo', 180)
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.timestamps()
      table.unique(['client_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
