# AdoptMe

Proyecto de Programacion Backend III de Coderhouse.

Es una API para un sistema de adopcion de mascotas. Permite manejar usuarios,
mascotas, sesiones y adopciones. Ademas tiene un modulo de mocks para generar
datos de prueba, la documentacion del modulo de usuarios hecha con Swagger y
los tests funcionales del router de adopciones.

## Tecnologias

- Node.js y Express
- MongoDB con Mongoose
- Mocha, Chai y Supertest para los tests
- Swagger para la documentacion
- Docker

## Instalacion

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

Despues copiar el archivo `.env.example` a `.env` y completar los datos:

```
PORT=8080
MONGO_URL=mongodb://localhost:27017/adoptme
MONGO_URL_TEST=mongodb://localhost:27017/adoptme_test
JWT_SECRET=poner_aca_una_clave_secreta
```

`MONGO_URL_TEST` es la base que se usa para correr los tests, conviene que sea
distinta a la de desarrollo porque las colecciones se borran en cada test.

`JWT_SECRET` es la clave con la que se firman los tokens de las sesiones. El
servidor no arranca si falta `MONGO_URL` o `JWT_SECRET`.

## Como levantar el proyecto

```bash
npm start
```

Y para desarrollo, con nodemon:

```bash
npm run dev
```

El servidor queda escuchando en el puerto 8080.

## Tests

```bash
npm test
```

Corre los tests funcionales de `adoption.router.js`. Se prueban los tres
endpoints del router, tanto los casos que funcionan bien como los que devuelven
error: adopcion inexistente, usuario inexistente, mascota inexistente y mascota
que ya fue adoptada.

## Documentacion

La documentacion del modulo de usuarios esta hecha con Swagger y se puede ver
levantando el proyecto y entrando a:

```
http://localhost:8080/api/docs
```

## Endpoints

Usuarios:

- `GET /api/users` devuelve todos los usuarios
- `GET /api/users/:uid` devuelve un usuario por id
- `PUT /api/users/:uid` actualiza un usuario
- `DELETE /api/users/:uid` elimina un usuario

Mascotas:

- `GET /api/pets` devuelve todas las mascotas
- `POST /api/pets` crea una mascota
- `POST /api/pets/withimage` crea una mascota con imagen
- `PUT /api/pets/:pid` actualiza una mascota
- `DELETE /api/pets/:pid` elimina una mascota

Adopciones:

- `GET /api/adoptions` devuelve todas las adopciones
- `GET /api/adoptions/:aid` devuelve una adopcion por id
- `POST /api/adoptions/:uid/:pid` adopta una mascota

Sesiones:

- `POST /api/sessions/register` registra un usuario
- `POST /api/sessions/login` inicia sesion
- `GET /api/sessions/current` devuelve el usuario logueado

Mocks:

- `GET /api/mocks/mockingpets` genera mascotas de prueba sin guardarlas
- `GET /api/mocks/mockingusers` genera 50 usuarios de prueba sin guardarlos
- `POST /api/mocks/generateData` genera e inserta usuarios y mascotas en la base

Los dos primeros aceptan `?quantity=` para cambiar la cantidad. El tercero
recibe por body los numeros de usuarios y mascotas a insertar:

```bash
curl -X POST http://localhost:8080/api/mocks/generateData \
  -H "Content-Type: application/json" \
  -d "{\"users\":20,\"pets\":10}"
```

Los usuarios generados tienen la contraseña `coder123` encriptada, el rol varia
entre `user` y `admin` y el campo `pets` viene vacio.

## Manejo de errores

Los controladores capturan los errores y los mandan a un middleware que esta al
final de `app.js`. Si se manda un id que no tiene el formato de un ObjectId de
Mongo la API responde 400 con el mensaje `Invalid id format` en lugar de cortarse,
y cualquier otro error que no este contemplado devuelve un 500.

## Docker

Imagen del proyecto en Docker Hub:

https://hub.docker.com/r/terab12/adoptme

Para bajarla y ejecutarla:

```bash
docker pull terab12/adoptme:latest
```

```bash
docker run -p 8080:8080 \
  -e MONGO_URL="mongodb://host.docker.internal:27017/adoptme" \
  -e JWT_SECRET="poner_aca_una_clave_secreta" \
  terab12/adoptme:latest
```

Las variables `MONGO_URL` y `JWT_SECRET` son obligatorias, sin ellas el
contenedor no levanta. Si la base de datos corre en Atlas hay que pasar la
cadena de conexion de Atlas en lugar de la de localhost.

Para construir la imagen a mano desde el repositorio:

```bash
docker build -t adoptme .
```
