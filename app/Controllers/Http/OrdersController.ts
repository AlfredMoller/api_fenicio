import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Solicitudes from 'App/Models/Solicitud';
import Solicitud from 'App/Models/Solicitud';
import { COD_SUCURSAL, COD_DEPOSITO, COD_EMPRESA, COD_TP_COMP, COD_VENDEDOR, COD_VENDEDOR_SUP } from 'Config/confapi';
export default class OrdersController {

    public async orden({ request, response }: HttpContextContract) {

        /**
         * Description: valida que la conexxin con sybase este activa caso contrario la renueva 
         */
        let conectadore = await Database.manager.report()
        if (!conectadore.health.healthy)
            await Database.manager.close('sybase')

        try {

            // request.qs()._idSolicitud != null ? request.qs()._idSolicitud : `00325120000-FNSHPUY-${request.id()}`;
            request.qs()._idSolicitud = request.all()._idSolicitud;


            await Database.connection('mysql')
                .table('solicitudes')
                .insert({
                    _idSolicitud: request.qs()._idSolicitud,
                    recuest_data: `${request.raw()}`,
                    origen: request.completeUrl(),
                    metodo: request.method(),

                }).exec()
                .catch(function (e) {
                });

            // console.log(newSolicitud)

            type EstadoOrden = string; // Definir el tipo correcto para EstadoOrden


            // Definición de la entidad Usuario
            interface Usuario {
                id: number;
                codigo?: string | null;
                email: string;
                nombre: string;
                apellido?: string | null;
                telefono: string;
                genero?: 'M' | 'F' | null;
                documento?: Documento | null;
                extras?: Record<string, any> | null;
            }

            // Definicion de documento
            interface Documento {
                numero: string;
                pais: string; // Código ISO 3166-1 del país
                tipo: 'PASAPORTE' | 'DOCUMENTO_IDENTIDAD'; // Valores posibles
            }

            interface Direccion {
                latitud?: number | null;
                longitud?: number | null;
                pais: string;
                estado: string;
                localidad: string;
                calle: string;
                numeroPuerta: string;
                numeroApto?: string | null;
                codigoPostal?: string | null;
                observaciones?: string | null;
            }


            // Definición de la entidad Pago
            interface Pago {
                id: number;
                idExterno?: string | null;
                codigo: string; // Valores posibles: ver Medios de pago.
                conector: string; // Valores posibles: ver Integradores de pago.
                estado: 'PENDIENTE' | 'APROBADO' | 'ERROR' | 'CANCELADO' | 'REVERSADO';
                fechaVencimiento?: Date | null;
                fechaPago?: Date | null;
                fechaCancelacion?: Date | null;
                cuotas: number;
                importe: number;
                moneda: string; // Código ISO 4217 de la moneda. Ejemplo: UYU, GS...
                bin?: string | null;
                autorizacion?: string | null;
                numeroTarjeta?: string | null; // Número de tarjeta de pago (enmascarado).
                terminacionTarjeta?: string | null; // Últimos 4 dígitos de la tarjeta de pago.
            }

            type EstadoEntrega = 'RECIBIDO' | 'PREPARANDO' | 'AGUARDANDO_DESPACHO' | 'EN_TRANSITO' | 'LISTO_PARA_RETIRAR' | 'ENTREGADO';
            interface FranjaEntrega {
                desde: Date;
                hasta: Date;
            }
            interface ServicioEntrega {
                id: number;
                codigo?: string | null;
                nombre: string;
            }


            interface OrdenEntrega {
                tipo: 'RETIRO' | 'ENVIO'; // Ajusta según los valores posibles
                estado?: EstadoEntrega | null;
                horario?: FranjaEntrega | null;
                destinatario?: string | null;
                direccionEnvio?: Direccion | null;
                local?: string | null;
                servicioEntrega?: ServicioEntrega | null;
                codigoTracking?: string | null;
                etiqueta?: string | null;
            }


            interface OrdenLinea {
                nombre: string;
                sku: string;
                codigoPrecio: string;
                cantidad: number;
                cantidadRegalo: number;
                precio: number;
                descuentos?: OrdenDescuento[] | null;
                atributos?: Record<string, any> | null;
            }

            interface OrdenDescuento {
                nombre: string;
                codigo: string;
                origen: 'CUPON' | 'PRODUCTO' | 'MEDIO_DE_PAGO' | 'PROMOCION';
                monto: number;
            }

            interface EventoCallCenter {
                // Definir la interfaz para EventoCallCenter
            }

            interface OrdenModel {
                warning: number;
                numeroOrden?: number; // Puede ser opcional dependiendo de tus necesidades.
                idOrden: string;
                idOrdenOrigen?: string | null;

                /**
                 * codigo de referancia para el envio
                 */
                referencia?: string | null;
                estado: EstadoOrden;
                motivoCancelacion?: string | null;
                origen: string;
                fechaInicio: Date;
                fechaAbandono?: Date | null;
                fechaRecuperada?: Date | null;
                fechaFin?: Date | null;
                fechaCancelada?: Date | null;
                comprador: Usuario;
                direccionFacturacion?: Direccion | null;
                codigoTributario?: string | null;
                razonSocial?: string | null;
                moneda: string;
                pago?: Pago | null;
                entrega?: OrdenEntrega | null;
                lineas: OrdenLinea[];
                impuestos: number;
                importeTotal: number;
                observaciones?: string | null;
                historialCallCenter: EventoCallCenter[];
            }
            try {
                const orden = request.body() as OrdenModel;

                //logica de integracion 
                /**
                 * Descripcion: Consulta de cliente 
                 */
                let cliente = await Database
                    .connection('sybase')
                    .from('DBA.CLIENTES')
                    .select('DBA.CLIENTES.COD_CLIENTE as codigo')
                    .where('DBA.CLIENTES.cod_empresa', `${COD_EMPRESA}`)
                    .where('DBA.CLIENTES.cod_sucursal', `${COD_SUCURSAL}`)
                    .where('DBA.CLIENTES.CEDULA', `${orden.comprador.documento?.numero}`)
                    .timeout(100)
                    .firstOrFail()
                    .catch(function (e) {
                        const regex = /(SQL Anywhere Error.*)/gm;
                        let m
                        while ((m = regex.exec(e)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex.lastIndex) {
                                regex.lastIndex++;
                            }

                            // The result can be accessed through the `m`-variable.
                            m.forEach((match, groupIndex) => {
                                console.log(`Found match, group ${groupIndex}: ${match}`);

                                throw new Error(match);
                            });
                        }
                    });
                if (cliente?.codigo === undefined) {
                    console.log('se inserta cliente')
                    const clientData = {
                        Cod_Empresa: `${COD_EMPRESA}`,
                        Cod_Cliente: orden.comprador.documento?.numero, // cédula de cliente
                        Cliente_Padre: null,
                        CodPlanCta: '101030101',
                        CodPlanAux: orden.comprador.documento?.numero, // cédula de cliente
                        Cod_Con_Vta: '24',
                        Cod_Zona: '411',
                        Cod_Tp_Cliente: '00',
                        Cod_Calificacion: '00',
                        Cod_Localidad: '01',
                        List_Precio: '4',
                        CodMoneda: 'GS',
                        Limite_Cr_Gs: 0.0000,
                        Limite_Cr_ME: 0.0000,
                        Descuento: 0.00,
                        Cedula: orden.comprador.documento?.numero,
                        CIP: null,
                        Fecha_Nac: null,
                        Cat_IVA: 'I',
                        Ult_Compra: '2016-10-18 00:00:00.000',
                        Ult_Pago: '2016-10-19 00:00:00.000',
                        Ult_Actualizacion: '2015-12-16 10:06:59.703',
                        Estado: 'A',
                        Cod_Usuario: 'ecommerce',
                        Razon_Social: `${orden.comprador.nombre} ${orden.comprador.apellido}`, // NOMBRE Y APELLIDO
                        RUC: orden.comprador.documento?.numero, // ruc
                        Contacto: null,
                        Direccion: '.',
                        Direccion_Part: '.',
                        Email: 'ejemplo@fenicio.io',
                        Telefono1: '+595961456789',
                        Telefono2: null,
                        Fax: null,
                        Nro_Tarjeta: null,
                        Venc_Tarjeta: null,
                        Referencia_1: null,
                        Referencia_2: null,
                        Referencia_3: null,
                        Observ: '.',
                        Cod_Tarjeta: null,
                        Celular: null,
                        RadioMensaje: null,
                        CodRadioMens: null,
                        nrocliente: 0,
                        SaldoPorCliente: 'S',
                        TipoDcto: 'C',
                        transf_vtdir: 'N',
                        CodPlanCta_ME: '101030101',
                        CodPlanAux_ME: orden.comprador.documento?.numero,
                        DiasMora: 0,
                        Moroso: 'N',
                        cod_cobrador: '00',
                        NroServicio: null,
                        COD_CLIENTE_CAP: null,
                        BloquearLista: 'N',
                        CantFactSaldo: 0,
                        responsable: null,
                        plantilla: 'C',
                        Cod_Original: null,
                        CodPais: 'PY',
                        CodDptoPais: 'AD',
                        CodCiudad: '002',
                        CodBarrio: '304',
                        Casa: 'PR',
                        EstadoCivil: 'SO',
                        CodCodeudorConyug: null,
                        CodCodeudor: null,
                        CodConyugue: null,
                        CtaCteCatastral: null,
                        Patente: null,
                        Cod_Sucursal: `${COD_SUCURSAL}`, // sucursal
                        Periodo: null,
                        cod_asociacion: null,
                        FechaAlta: '2016-10-18 17:34:55.094',
                        Fec_Ult_Visita: null,
                        NroSerie: null,
                        DNA: null,
                        FechaBaja: null,
                        VctoRegDist: null,
                        BloqMoneda: 'N',
                        Cod_Cartera: null,
                        Cod_Ramo: null,
                        Porc_Inc_Precios: 0.00,
                        Red_Social: null,
                        Messenger: null,
                        Skype: null,
                        monto_inc_precios: 0.0000,
                        Dias_Cheque: 0,
                        Foto1: null,
                        Ult_Fecha_Notif: null,
                        Tpo_Notificacion: null,
                        ult_mov_inforcomf: null,
                        Inforcomf: 'N',
                        incluir_inforcomf: 'S',
                        Sexo: `${orden.comprador.genero}`, // GÉNERO
                        Cod_Segmento: null,
                        Longitud: null,
                        Latitud: null,
                        PermitirRemisiones: 'S',
                        Coordenadas: null,
                        Primer_Nombre: null,
                        Segundo_Nombre: null,
                        Primer_Apellido: null,
                        Segundo_Apellido: null,
                        fechanotificacion: null,
                        gln_cliente: null
                    };


                    const insertCliente = await Database
                        .connection('sybase')
                        .table('DBA.CLIENTES')
                        .timeout(100)
                        .insert(
                            clientData
                        ).exec()
                        .catch(function (e) {
                            const regex = /(SQL Anywhere Error.*)/gm;
                            let m
                            while ((m = regex.exec(e)) !== null) {
                                // This is necessary to avoid infinite loops with zero-width matches
                                if (m.index === regex.lastIndex) {
                                    regex.lastIndex++;
                                }

                                // The result can be accessed through the `m`-variable.
                                m.forEach((match, groupIndex) => {
                                    console.log(`Found match, group ${groupIndex}: ${match}`);

                                    throw new Error(match);
                                });
                            }
                        });
                }

                cliente = await Database
                    .connection('sybase')
                    .from('DBA.CLIENTES')
                    .select('DBA.CLIENTES.COD_CLIENTE as codigo')
                    .where('DBA.CLIENTES.cod_empresa', `${COD_EMPRESA}`)
                    .where('DBA.CLIENTES.cod_sucursal', `${COD_SUCURSAL}`)
                    .where('DBA.CLIENTES.CEDULA', `${orden.comprador.documento?.numero}`)
                    .timeout(100)
                    .firstOrFail()
                    .catch(function (e) {
                        const regex = /(SQL Anywhere Error.*)/gm;
                        let m
                        while ((m = regex.exec(e)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex.lastIndex) {
                                regex.lastIndex++;
                            }

                            // The result can be accessed through the `m`-variable.
                            m.forEach((match, groupIndex) => {
                                console.log(`Found match, group ${groupIndex}: ${match}`);

                                throw new Error(match);
                            });
                        }
                    });

                /**
                 * consulta numero de comprobante
                 */
                const numComprobante = await Database
                    .connection('sybase')
                    .from('DBA.PRESUPCAB')
                    .where('DBA.PRESUPCAB.cod_empresa', `${COD_EMPRESA}`)
                    .where('DBA.PRESUPCAB.cod_sucursal', `${COD_SUCURSAL}`)
                    .where('DBA.PRESUPCAB.cod_tp_comp', `${COD_TP_COMP}`)
                    .max('COMP_NUMERO', 'numComprobante')
                    .timeout(100)
                    .firstOrFail()
                    .catch(function (e) {
                        const regex = /(SQL Anywhere Error.*)/gm;
                        let m
                        while ((m = regex.exec(e)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex.lastIndex) {
                                regex.lastIndex++;
                            }

                            // The result can be accessed through the `m`-variable.
                            m.forEach((match, groupIndex) => {
                                console.log(`Found match, group ${groupIndex}: ${match}`);

                                throw new Error(match);
                            });
                        }
                    });


                orden.referencia = isNaN(numComprobante.numComprobante) ? 1 : numComprobante.numComprobante + 1;


                const valuesCab = {
                    Cod_Empresa: `${COD_EMPRESA}`,
                    Cod_Tp_Comp: `${COD_TP_COMP}`,
                    Comp_Numero: orden.referencia,
                    Cod_Sucursal: `${COD_SUCURSAL}`,
                    Cod_Cliente: cliente?.codigo,
                    Lista_Prec: 1,
                    Fha_Cbte: orden.fechaInicio,
                    FechaVcto: orden.fechaFin,
                    Cod_Con_Vta: '00',
                    Estado: 'P',
                    Cod_Tp_Pago: 'E ',
                    Tipo_Vta: '01',
                    Cod_Vendedor: `${COD_VENDEDOR}`,
                    Com_Vendedor: 0.00,
                    ComisMan: 'n',
                    CodMoneda: 'GS',
                    Fact_Cambio: 1.0000,
                    Descuento: 0.00,
                    To_Exento: 0.0000,
                    To_Gravado: orden.importeTotal,
                    Total_IVA: orden.impuestos,
                    Tipo_IVA: 'I',
                    Autorizado: 'N',
                    Anulado: 'N',
                    Cod_Usuario: 'vtasrodolf      ',
                    Caja: `salon1`,
                    Asentado: 'N',
                    AsentadoCV: 'N',
                    Razon_Social: `${orden.comprador.nombre} ${orden.comprador.apellido}`,
                    Direccion: orden.direccionFacturacion?.calle,
                    RUC: cliente.codigo,
                    Telefono: orden.comprador.telefono,
                    Total_venta: orden.importeTotal,
                    totaldctoexen: 0.0000,
                    totaldctograv: 0.0000,
                    totaldctograv_d: 0.0000,
                    totaldctoexen_d: 0.0000,
                    Descuento2do: 0.00,
                    Tot2DoDctoExen: 0.0000,
                    Tot2DoDctoGrav: 0.0000,
                    TotalDescuento: 0.0000,
                    SectorFacturacion: '0',
                    Cod_Tp_Comp_Orig: 'NPIL',
                    Comp_Numero_Orig: 26334,
                    modfecha: 0,
                    modfechavcto: 0,
                    Prt_Lista_Prec: 0,
                    codtpfactura: 'FCOE',
                    to_gravado_5: 0.0000,
                    totaldctograv_5: 0.0000,
                    totaldctograv_d_5: 0.0000,
                    tot2dodctograv_5: 0.0000,
                    Total_Iva_5: 0.0000,
                    to_gravado_10: orden.impuestos,
                    totaldctograv_10: 0.0000,
                    totaldctograv_d_10: 0.0000,
                    tot2dodctograv_10: 0.0000,
                    Total_Iva_10: orden.importeTotal,
                    NroSerie: 'NOTAPEDILUM',
                    reg_turismo: 'NO',
                    inc_precios: 0.00,
                    recalculado: 'N',
                    PlazoEntrega: 0,
                    Cod_Vendedor_Sup: `${COD_VENDEDOR_SUP}`,
                    cod_tp_comp_vend_planilla: '',
                    comp_numero_vend_planilla: 0,
                    plantilla: 'P',
                    ConEntrega: 'N',
                }



                /**
                 * MODELO OBJETO DETALLE
                 */
                type objDetail = {
                    Cod_Empresa: string;
                    Cod_Tp_Comp: string;
                    Comp_Numero: number;
                    Linea: number;
                    Cod_Sucursal: string;
                    Cod_Deposito: string;
                    Cod_Articulo: string;
                    Cantidad: number;
                    Descuento: number;
                    Pr_Unit: number;
                    Total: number;
                    COD_VENDEDOR: string;
                    Cod_Iva: string;
                    Iva: number;
                    Descrip: string;
                    CantCajas: number;
                    MANUAL: string;
                    totaldcto: number;
                    CantMinima: number;
                    CantJuego: number;
                    total_neto: number;
                    Lista_Prec: number;
                    Prt_Cod_Deposito: number;
                    Prt_Lista_Prec: number;
                    Prt_Cod_Articulo: number;
                    Prt_Cantidad: number;
                    Prt_Pr_Unit: number;
                    Prt_Descuento: number;
                    Prt_TotalDcto: number;
                    Prt_Total: number;
                    Descuento_Cant: number;
                    manual_dcto: string;
                    cantfacturada: number;
                    prec_base_unit: number;
                    PorcPartGravado: number;
                    MontopartGravado: number;
                    Sucursal_Orig: string;
                };

                /**
                 * MODELO OBJETO DETALLE
                 */
                type objOrdenFacturacion = {
                    Cod_Empresa: string;
                    /**comprobante del pedido*/
                    Cod_Tp_Comp: string;
                    /**Comp_Numero del pedido*/
                    Comp_Numero: number;
                    /** linea (incrementar por cada item)*/
                    Linea: number;
                    /**numero factura insertar null*/
                    OrDenFact: number;
                    /**fecha de la orden*/
                    FechaOrden: Date;
                    Cod_Deposito: string;
                    Cod_Articulo: string;
                    SaldoAnterior: number;
                    AFacturar: number;
                    /**comprobante de la factura insertar null*/
                    CodTpFactura: string | null;
                    /**comp numero de la factura insertar null*/
                    CompNroFactura: string | null;
                    /** lineas facturadas insertar null*/
                    LineaFactura: string | null;
                    anulado: string;
                    Cod_Sucursal: string | null;
                    anulaUsuario: string | null;
                };




                const objDetailArray: objDetail[] = [];
                const objOrdenFacturacionArray: objOrdenFacturacion[] = [];
                let contador = 1;

                for (const dato of orden.lineas) {

                    const nuevoDetail: objDetail = {
                        Cod_Empresa: `${COD_EMPRESA}`,
                        Cod_Tp_Comp: `${COD_TP_COMP}`,
                        Comp_Numero: parseInt(`${orden.referencia}`),
                        Linea: contador,
                        Cod_Sucursal: `${COD_SUCURSAL} `,
                        Cod_Deposito: `${COD_DEPOSITO} `,
                        Cod_Articulo: dato.sku,
                        Cantidad: dato.cantidad,
                        Descuento: 0.00,
                        Pr_Unit: dato.precio,
                        Total: dato.precio * dato.cantidad,
                        COD_VENDEDOR: `${COD_VENDEDOR}`,
                        Cod_Iva: 'G',
                        Iva: 10.00,
                        Descrip: dato.nombre,
                        CantCajas: 0.00,
                        MANUAL: '',
                        totaldcto: 0.0000,
                        CantMinima: 0.00,
                        CantJuego: 0.000,
                        total_neto: 0.0000,
                        Lista_Prec: 1,
                        Prt_Cod_Deposito: 1,
                        Prt_Lista_Prec: 0,
                        Prt_Cod_Articulo: 1,
                        Prt_Cantidad: 1,
                        Prt_Pr_Unit: 0,
                        Prt_Descuento: 0,
                        Prt_TotalDcto: 0,
                        Prt_Total: 1,
                        Descuento_Cant: 0,
                        manual_dcto: '',
                        cantfacturada: 0.000,
                        prec_base_unit: 0.0000,
                        PorcPartGravado: 100,
                        MontopartGravado: dato.precio,
                        Sucursal_Orig: `${COD_SUCURSAL}`,
                    }


                    const nuevoOrdenFacturacion: objOrdenFacturacion =
                    {
                        Cod_Empresa: `${COD_EMPRESA}`,
                        Cod_Tp_Comp: `${COD_TP_COMP}`,
                        Comp_Numero: parseInt(`${orden.referencia}`),
                        Linea: contador,
                        OrDenFact: parseInt(`${orden.referencia}`),
                        FechaOrden: orden.fechaInicio,
                        Cod_Deposito: `${COD_DEPOSITO} `,
                        Cod_Articulo: dato.sku,
                        SaldoAnterior: 0.000,
                        AFacturar: dato.cantidad,
                        CodTpFactura: null,
                        CompNroFactura: null,
                        LineaFactura: null,
                        anulado: 'N',
                        Cod_Sucursal: `${COD_SUCURSAL} `,
                        anulaUsuario: null,
                    }

                    objDetailArray.push(nuevoDetail);
                    objOrdenFacturacionArray.push(nuevoOrdenFacturacion);
                    contador++;

                }



                // const insertOrdenFacturacion = 



                /**
                 * GRABAR CABEZERA EN BASE 
                 */
                const cabecera = await Database
                    .connection('sybase')
                    .table('DBA.PRESUPCAB')
                    .timeout(100)
                    .insert(
                        valuesCab
                    ).exec()
                    .catch(function (e) {
                        const regex = /(SQL Anywhere Error.*)/gm;
                        let m
                        while ((m = regex.exec(e)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex.lastIndex) {
                                regex.lastIndex++;
                            }

                            // The result can be accessed through the `m`-variable.
                            m.forEach((match, groupIndex) => {
                                console.log(`Found match, group ${groupIndex}: ${match}`);

                                throw new Error(match);
                            });
                        }
                    });



                /**
                 * GRABAR DETALLE EN BASE 
                 */
                const detalle = await Database
                    .connection('sybase')
                    .table('DBA.PRESUPDET')
                    .timeout(100)
                    .multiInsert(
                        objDetailArray
                    ).exec()
                    .catch(function (e) {
                        const regex = /(SQL Anywhere Error.*)/gm;
                        let m
                        while ((m = regex.exec(e)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex.lastIndex) {
                                regex.lastIndex++;
                            }

                            // The result can be accessed through the `m`-variable.
                            m.forEach((match, groupIndex) => {
                                console.log(`Found match, group ${groupIndex}: ${match}`);

                                throw new Error(match);
                            });
                        }
                    });


                /**
                 * GRABAR DETALLE PAGO
                 */
                const pago = await Database
                    .connection('sybase')
                    .table('DBA.OrdenFacturacion')
                    .timeout(100)
                    .multiInsert(
                        objOrdenFacturacionArray
                    ).exec()
                    .catch(function (e) {
                        const regex = /(SQL Anywhere Error.*)/gm;
                        let m
                        while ((m = regex.exec(e)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex.lastIndex) {
                                regex.lastIndex++;
                            }

                            // The result can be accessed through the `m`-variable.
                            m.forEach((match, groupIndex) => {
                                console.log(`Found match, group ${groupIndex}: ${match}`);

                                throw new Error(match);
                            });
                        }
                    });


                await Solicitudes.query().where('  _idSolicitud  ', request.qs()._idSolicitud)
                    .update({
                        Cod_Empresa: `${COD_EMPRESA}`,
                        cod_sucursal: `${COD_SUCURSAL}`,
                        cod_tp_comp: `${COD_TP_COMP}`,
                        comp_numero: orden.referencia,
                    }).exec()
                    .catch(function (e) {
                    });


                return response.status(200).send(
                    {
                        status: "OK",
                        mensaje: "Orden registrada.",
                        _idSolicitud: `${request.qs()._idSolicitud}`,
                        data: {
                            referencia: `${orden.referencia}`
                        }
                    })
            } catch (e) {
                return response.status(500).send({
                    status: 'ERROR',
                    mensaje: e.message,
                    code: 500,
                    data: null,
                    _idSolicitud: request.qs()._idSolicitud,
                })
            }
        } catch (e) {
            return response.status(500).send({
                status: 'ERROR',
                mensaje: e?.message,
                code: 500,
                data: null,
                _idSolicitud: request.qs()._idSolicitud,
            })
        }
    }
} 
