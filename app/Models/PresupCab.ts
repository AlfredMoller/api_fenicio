import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class PresupCab extends BaseModel {
  @column()
  declare Cod_Empresa: string

  @column()
  declare Cod_Tp_Comp: string

  @column()
  declare Comp_Numero: string
  // declare Comp_Numero: number

  @column()
  declare Cod_Sucursal: string | null

  @column()
  declare Cod_Cliente: number | null

  @column()
  declare Lista_Prec: number

  // @column.dateTime()
  @column()
  // declare Fha_Cbte: DateTime
  declare Fha_Cbte: string

  // @column.dateTime()
  @column()
  // declare FechaVcto: DateTime
  declare FechaVcto: string

  @column()
  declare Cod_Con_Vta: string

  @column()
  declare Estado: string

  @column()
  declare Cod_Tp_Pago: string

  @column()
  declare Tipo_Vta: string

  @column()
  declare Cod_Vendedor: string | null

  @column()
  declare Com_Vendedor: number

  @column()
  declare ComisMan: string

  @column()
  declare CodMoneda: string | null

  @column()
  declare Fact_Cambio: number

  @column()
  declare Descuento: number

  @column()
  declare To_Exento: number

  @column()
  declare To_Gravado: number

  @column()
  declare Total_IVA: number

  @column()
  declare Tipo_IVA: string

  @column()
  declare Autorizado: string

  @column()
  declare Anulado: string

  @column()
  declare Cod_Usuario: string

  @column()
  declare Rf_Tp_Comp: string | null

  @column()
  declare Rf_Comp_Numero: number | null

  @column()
  declare Caja: string | null

  @column()
  declare Asentado: string | null

  @column()
  declare AsentadoCV: string | null

  @column()
  declare Razon_Social: string | null

  @column()
  declare Direccion: string | null

  @column()
  declare RUC: string | null

  @column()
  declare Telefono: string | null

  @column()
  declare Cod_Cajero: string | null

  @column()
  declare Total_diferido: number | null

  @column()
  declare Total_venta: number | null

  @column()
  declare totaldctoexen: number

  @column()
  declare totaldctograv: number

  @column()
  declare totaldctograv_d: number

  @column()
  declare totaldctoexen_d: number

  @column()
  declare Descuento2do: number | null

  @column()
  declare Tot2DoDctoExen: number | null

  @column()
  declare Tot2DoDctoGrav: number | null

  @column()
  declare TotalDescuento: number | null

  @column()
  declare SectorFacturacion: string | null

  @column()
  declare Cod_Tp_Comp_Orig: string

  @column()
  declare Comp_Numero_Orig: number | null

  @column()
  declare Usuario_Chg_Nro: string | null

  @column.dateTime()
  declare Fecha_Chg_numero: DateTime | null

  @column()
  declare modfecha: number | null

  @column()
  declare modfechavcto: number | null

  @column()
  declare Prt_Lista_Prec: number | null

  @column()
  declare codtpfactura: string | null

  @column.dateTime()
  declare aprobadoel: DateTime | null

  @column()
  declare aprobadopor: string | null

  @column()
  declare to_gravado_5: number | null

  @column()
  declare totaldctograv_5: number | null

  @column()
  declare totaldctograv_d_5: number | null

  @column()
  declare tot2dodctograv_5: number | null

  @column()
  declare Total_Iva_5: number | null

  @column()
  declare to_gravado_10: number | null

  @column()
  declare totaldctograv_10: number | null

  @column()
  declare totaldctograv_d_10: number | null

  @column()
  declare tot2dodctograv_10: number | null

  @column()
  declare Total_Iva_10: number | null

  @column()
  declare NroSerie: string | null

  @column()
  declare Cod_Analista: string | null

  @column()
  declare Lista_Prec_Dcto: number | null

  @column()
  declare reg_turismo: string | null

  @column()
  declare inc_precios: number | null

  @column()
  declare recalculado: string | null

  @column()
  declare PlazoEntrega: number | null

  @column()
  declare Destinatario: string | null

  @column()
  declare Cod_Vendedor_Sup: string | null

  @column()
  declare Cod_Televendedor: string | null

  @column()
  declare cod_tp_comp_vend_planilla: string | null

  @column()
  declare comp_numero_vend_planilla: number | null

  @column()
  declare cod_tp_comp_mvto: string | null

  @column()
  declare comp_Numero_mvto: number | null

  @column()
  declare plantilla: string | null

  @column()
  declare cod_cliente2: string | null

  @column()
  declare tipo_solcred: string | null

  @column()
  declare ConEntrega: string | null

  @column.dateTime()
  declare pendiente_el: DateTime | null

  @column()
  declare pendiente_por: string | null

  @column.dateTime()
  declare Cancelado_el: DateTime | null

  @column()
  declare Cancelado_por: string | null

  @column()
  declare recibido_por: string | null

  @column.dateTime()
  declare recibido_el: DateTime | null

  @column()
  declare cod_transportista: string | null

  @column.dateTime()
  declare Recepcionado_El: DateTime | null

  @column.dateTime()
  declare Cargado_El: DateTime | null

  @column()
  declare Cargado_Por: string | null

  @column.dateTime()
  declare rechazado_el: DateTime | null

  @column()
  declare rechazado_por: string | null

  @column.dateTime()
  declare entregado_el: DateTime | null

  @column()
  declare entregado_por: string | null

  @column()
  declare orden_compra: string | null

}
