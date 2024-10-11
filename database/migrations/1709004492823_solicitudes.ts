import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'solicitudes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('_idSolicitud').unique()
      table.string('origen').nullable()
      table.string('metodo').nullable()
      table.text('recuest_data')
      table.string('cod_empresa')
      table.string('cod_sucursal')
      table.string('cod_tp_comp')
      table.string('comp_numero')
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
