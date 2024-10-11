// import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
// import User from 'App/Models/User'
import { schema } from '@ioc:Adonis/Core/Validator'
import { COD_SUCURSAL, COD_DEPOSITO, COD_EMPRESA, COD_TP_COMP, COD_VENDEDOR, COD_VENDEDOR_SUP } from 'Config/confapi';

export default class ProductController {
  public async productos({ request, response }: HttpContextContract) {

    /**
     * Description: valida que la conexxin con sybase este activa caso contrario la renueva 
     */
    let conectadore = await Database.manager.report()
    if (!conectadore.health.healthy)
      await Database.manager.close('sybase')

    // request.qs()._idSolicitud != null ? request.qs()._idSolicitud : `00325120000-FNSHPUY-${request.id()}`;
    // request.qs()._idSolicitud = `00325120000-FNSHPUY-${request.id()}`;
    request.qs()._idSolicitud = request.all()._idSolicitud;;

    Database.connection('mysql')
      .table('solicitudes')
      .insert({
        _idSolicitud: request.qs()._idSolicitud,
        recuest_data: `${request.raw()}`,
        origen: request.completeUrl(),
        metodo: request.method(),

      }).exec()
      .catch(function (e) {
      });
    let parametros = request.only(['desde', 'total', '_idSolicitud'])
    try {
      await request.validate({
        schema: schema.create({
          desde: schema.number(),
          total: schema.number(),
          _idSolicitud: schema.string(),
        }),
      })

      try {
        const productos = await Database
          .connection('sybase')
          .from('DBA.ARTICULO')
          .select(
            Database.raw(
              ` * FROM ( select top ${parametros.total} start at ${parametros.desde === 0 ? 1 : parametros.desde} [DBA].[ARTICULO].[cod_articulo] as codigo `
            )
          )
          // .select(
          //   Database.raw(
          //     `top ${parametros.total} start at ${parametros.desde === 0 ? 1 : parametros.desde} [DBA].[ARTICULO].[cod_articulo] as codigo`
          //   )
          // )
          // .select('DBA.ARTICULO.cod_articulo as codigo')
          .select('DBA.ARTICULO.des_art as nombre')
          .select('DBA.ARTICULO.cod_grupo')
          .select('DBA.ARTICULO.cod_familia')
          .select('DBA.FAMILIA.des_familia')
          .select('DBA.ARTICULO.cod_original')
          .select('DBA.ARTICULO.pr4_gs')
          .select('DBA.ARTICULO.pr4_me')
          .select('DBA.ARTICULO.CodMoneda')
          // .select(
          //   Database.raw(
          //     'DBA.f_get_ArticuloExistencia(DBA.ARTICULO.cod_empresa, DBA.ARTICULO.cod_articulo) as existencia'
          //   )
          // )
          .select(
              Database.raw(
                ` (  Select  Sum(existencia)
   from [DBA].ARTDEP ar
   where ar.cod_empresa =  '${COD_EMPRESA}'
   and	ar.cod_articulo = [DBA].[ARTICULO].[cod_articulo]
   AND ar.existencia > 0 ) as existencia `
              )
            )
          .join('DBA.FAMILIA', 'DBA.ARTICULO.cod_familia', 'DBA.FAMILIA.cod_familia')
          .where('DBA.ARTICULO.cod_empresa', `${COD_EMPRESA}`,)
          .whereRaw('DBA.FAMILIA.COD_FAMILIA not in (?,?)', ['GA', '011'])
          // .limit(parametros.total)
          // .offset(parametros.desde)
          // .orderBy('codigo')
          .orderByRaw(
            Database.raw(
              '  [codigo] asc ) as xd  WHERE xd.existencia is not NULL '
            ))
          .timeout(1000)
        // Los campos precio_lista y precio_venta tendrían que llegar como "precioLista" y "precioVenta".
        let newProduct: any[] = []
        productos.forEach((d) => {
          let lista = {
            codigo: d.codigo.trim(),
            nombre: d.nombre,
            monedaPredeterminada: 'PYG',
            variantes: [
              {
                codigo: d.codigo.trim(),
                presentaciones: [
                  {
                    codigo: `U`,
                    nombre: d.nombre,
                    sku: d.codigo.trim(),
                    stock: d.existencia,
                    precioLista: {
                      PYG: d.pr4_gs,
                      USD: d.pr4_me,
                    },
                    precioVenta: {
                      PYG: Math.round(d.pr4_gs - (d.pr4_gs * 0.20)),
                      USD: Math.round(d.pr4_me - (d.pr4_me * 0.20)),
                    },
                    preciosAlternativos: [
                      {
                        codigo: "CUOTA_1",
                        precioLista: {
                          PYG: d.pr4_gs,
                          USD: d.pr4_me,
                        },
                        precioVenta: {
                          PYG: Math.round(d.pr4_gs - (d.pr4_gs * 0.20)),
                          USD: Math.round(d.pr4_me - (d.pr4_me * 0.20)),
                        }
                      },
                      {
                        codigo: "CUOTA_3",
                        precioLista: {
                          PYG: d.pr4_gs,
                          USD: d.pr4_me,
                        },
                        precioVenta: {
                          PYG: Math.round(d.pr4_gs - (d.pr4_gs * 0.15)),
                          USD: Math.round(d.pr4_me - (d.pr4_me * 0.15)),
                        }
                      },
                      {
                        codigo: "CUOTA_6",
                        precioLista: {
                          PYG: d.pr4_gs,
                          USD: d.pr4_me,
                        },
                        precioVenta: {
                          PYG: Math.round(d.pr4_gs - (d.pr4_gs * 0.10)),
                          USD: Math.round(d.pr4_me - (d.pr4_me * 0.10)),
                        }
                      },
                      {
                        codigo: "CUOTA_10",
                        precioLista: {
                          PYG: d.pr4_gs,
                          USD: d.pr4_me,
                        },
                        precioVenta: {
                          PYG: d.pr4_gs,
                          USD: d.pr4_me,
                        }
                      }
                    ],
                  },
                ],
              },
            ],
          }

          newProduct.push(lista)
        })

        //await post.preload("user");
        return response.status(200).send({
          status: 'OK',
          code: 200,
          mensaje: null,
          _idSolicitud: parametros._idSolicitud,
          data: {
            desde: Number(parametros.desde),
            total: newProduct.length,
            productos: newProduct,
          },
        })
      } catch (err) {
        console.log(err.name)
        if (err.name === 'KnexTimeoutError') {
          return response.status(408).send({
            status: 'ERROR',
            message: err.message,
            code: 408,
            _idSolicitud: parametros._idSolicitud,
            data: null,
          })
        }
        return response.status(404).send({
          status: 'ERROR',
          message: err.message,
          code: 404,
          _idSolicitud: parametros._idSolicitud,
          data: null,
        })
      }
    } catch (e) {
      return response.status(400).send({
        status: 'ERROR',
        mensaje: e.messages.errors,
        code: 400,
        data: null,
        _idSolicitud: request.qs()._idSolicitud,
      })
    }
  }

  public async productoSKUS({ request, response }: HttpContextContract) {
    /**
     * Description: valida que la conexxin con sybase este activa caso contrario la renueva 
     */
    let conectadore = await Database.manager.report()
    if (!conectadore.health.healthy)
      await Database.manager.close('sybase')

    // request.qs()._idSolicitud != null ? request.qs()._idSolicitud : `00325120000-FNSHPUY-${request.id()}`;
    // request.qs()._idSolicitud = `00325120000-FNSHPUY-${request.id()}`;
    request.qs()._idSolicitud = request.all()._idSolicitud;

    Database.connection('mysql')
      .table('solicitudes')
      .insert({
        _idSolicitud: request.qs()._idSolicitud,
        recuest_data: `${request.raw()}`,
        origen: request.completeUrl(),
        metodo: request.method(),

      }).exec()
    let parametros = request.only(['_idSolicitud', 'skus'])
    try {
      await request.validate({
        schema: schema.create({
          _idSolicitud: schema.string(),
        }),
      })

      let skus: any[] = []

      // const contentType = request.is(['json', 'string'])
      if (!parametros.skus) {
        return response.status(400).send({
          status: 'ERROR',
          mensaje: "Falta parametro skus:['548972-002-01','548972-002-03']",
          code: 400,
          data: null,
          _idSolicitud: request.qs()._idSolicitud,
        })
      }

      if (request.hasBody()) {
        // parse request body
        if (!Array.isArray(request.body().skus)) {
          return response.status(400).send({
            status: 'ERROR',
            mensaje: 'Key sskus debe ser array ej:skus:["548972-002-01","548972-002-03"]',
            code: 400,
            data: null,
            _idSolicitud: request.qs()._idSolicitud,
          })
        }
        let p = request.body().skus
        skus = p
      } else {
        try {
          let p = parametros.skus.replace(/'/gi, '"')
          console.log(p)
          skus = JSON.parse(p)
        } catch (error) {
          return response.status(400).send({
            status: 'ERROR',
            mensaje: 'Key skus debe ser array ej:skus:["548972-002-01","548972-002-03"]',
            code: 400,
            data: null,
            _idSolicitud: request.qs()._idSolicitud,
          })
        }
      }

      try {
        const productos = await Database.connection('sybase').from('DBA.ARTICULO')

          .select('DBA.ARTICULO.cod_articulo as codigo')
          .select('DBA.ARTICULO.des_art as nombre')
          .select('DBA.ARTICULO.cod_grupo')
          .select('DBA.ARTICULO.cod_familia')
          .select('DBA.FAMILIA.des_familia')
          .select('DBA.ARTICULO.cod_original')
          .select('DBA.ARTICULO.pr4_gs')
          .select('DBA.ARTICULO.pr4_me')
          .select('DBA.ARTICULO.CodMoneda')
          .select(
            Database.raw(
              'DBA.f_get_ArticuloExistencia(DBA.ARTICULO.cod_empresa, DBA.ARTICULO.cod_articulo) as existencia'
            )
          )
          .join('DBA.FAMILIA', 'DBA.ARTICULO.cod_familia', 'DBA.FAMILIA.cod_familia')
          .where('DBA.ARTICULO.cod_empresa', `${COD_EMPRESA}`,)
          .whereRaw('DBA.FAMILIA.COD_FAMILIA not in (?,?)', ['GA', '011'])
          .whereIn('DBA.ARTICULO.cod_articulo', skus)
          .orderBy('codigo')
          .timeout(1000)

        let newProduct: any[] = []
        productos.forEach((d) => {
          let lista = {
            sku: d.codigo.trim(),
            stock: d.existencia,
            nombre: d.nombre,
            /*precio_lista: {
              PYG: d.pr4_gs,
              USD: d.pr4_me,
            },
            precio_venta: {
              PYG: d.pr4_gs,
              USD: d.pr4_me,
            },*/
          }

          newProduct.push(lista)
        })

        //await post.preload("user");
        return response.status(200).send({
          status: 'OK',
          code: 200,
          mensaje: null,
          _idSolicitud: parametros._idSolicitud,
          data: {
            stockPorSku: newProduct,
          },
        })
      } catch (err) {
        console.log(err.name)
        if (err.name === 'KnexTimeoutError') {
          return response.status(408).send({
            status: 'ERROR',
            message: err.message,
            code: 408,
            _idSolicitud: parametros._idSolicitud,
            data: null,
          })
        }
        return response.status(404).send({
          status: 'ERROR',
          message: err.message,
          code: 404,
          _idSolicitud: parametros._idSolicitud,
          data: null,
        })
      }
    } catch (e) {
      console.log(e)
      return response.status(400).send({
        status: 'ERROR',
        mensaje: e.messages.errors,
        code: 400,
        data: null,
        _idSolicitud: request.qs()._idSolicitud,
      })
    }
  }
}
