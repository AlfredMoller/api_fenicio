// import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'

export default class AuthController {
  public async login({ request, auth, response }: HttpContextContract) {
    const data = request.only(['client_id', 'client_credentials'])

    try {
      // const token = await Database.rawQuery("select * from users where email='" + data.email + "'");
      const token = await auth.use('api').attempt(data.client_id, data.client_credentials, {

      })
      //console.log(token);
      const user = await auth.user

      /*const token = await auth.use('api').attempt(data.email, data.password, {
        expiresIn: '10 days',
      }) */

      return response.status(200).send({
        message: 'Login Success',
        code: 200,
        error: false,
        userName: user?.name,
        results: token,
      })
    } catch (err) {
      if (err.message.search('@p') > 0) {
        try {
          const token = await auth.use('api').attempt(data.client_id, data.client_credentials, {

          })
          //console.log(token);

          /*const token = await auth.use('api').attempt(data.email, data.password, {
                expiresIn: '10 days',
              }) */

          const user = await auth.user
          return response.status(200).send({
            message: 'Login Success',
            code: 200,
            error: false,
            userName: user?.name,
            results: token,
          })
        } catch (e) {
          return response.status(400).send({
            message: e.message,
            code: 400,
            error: false,
            results: null,
          })
        }
      } else {
        return response.status(400).send({
          message: err.message,
          code: 400,
          error: false,
          results: null,
        })
      }
    }
  }
  public async register({ request, auth, response }: HttpContextContract) {
    const data = request.only(['client_id', 'name', 'client_credentials', 'codigo_cliente'])
    try {
      const newUser = new User()
      newUser.client_id = data.client_id
      newUser.password = data.client_credentials
      newUser.codigo = data.codigo_cliente
      newUser.name = data.name
      await newUser.save()
      const token = await auth.use('api').login(newUser, {

      })
      return response.status(200).send({
        message: 'Register Success',
        code: 200,
        error: false,
        results: token,
      })
    } catch (err) {
      return response.status(400).send({
        message: err.message,
        code: 400,
        error: true,
        results: err,
      })
    }
  }

  public async user({ auth, response }: HttpContextContract) {
    try {
      return response.status(200).send({
        message: 'Get User Success',
        code: 200,
        error: false,
        results: auth.user,
      })
    } catch (err) {
      return response.status(400).send({
        message: err.message,
        code: 400,
        error: true,
        results: null,
      })
    }
  }
  public async getUser({ auth, response, params }: HttpContextContract) {
    const user = await User.find(params.id)
    auth.user
    try {
      return response.status(200).send({
        message: 'Get User Success',
        code: 200,
        error: false,
        results: user,
      })
    } catch (err) {
      return response.status(400).send({
        message: err.message,
        code: 400,
        error: true,
        results: null,
      })
    }
  }
}
