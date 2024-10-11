import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Solicitudes extends BaseModel {
  static connection = 'mysql'

  public static table = 'solicitudes'

  @column({ isPrimary: true })
  public id: number

  @column()
  public _idSolicitud: string

  @column()
  public recuest_data: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
