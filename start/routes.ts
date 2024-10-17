/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/
import Route from '@ioc:Adonis/Core/Route'
import * as fs from 'fs';

Route.get('/', async () => {
  const packageJsonContent = fs.readFileSync('package.json', 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);
  const info = {
    appName: packageJson.name,
    version: packageJson.version,
    description: 'Integracion para ecommerce fenicio',
  };

  return info
})

Route.group(() => {
  // register
  Route.post('register', 'AuthController.register')
  // login
  Route.post('login', 'AuthController.login')
}).prefix('auth')

Route.group(() => {
  Route.post('productos', 'ProductController.productos')
  Route.get('stockporsku', 'ProductController.productoSKUS')
  Route.post('orden', 'OrdersController.orden')
}).middleware('auth:api')
