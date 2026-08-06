# AdoptMe

Proyecto de la diplomatura Programacion Backend III de Coderhouse.

## Instalacion

```bash
npm install
```

Copiar `.env.example` a `.env` y completar la conexion a Mongo:

```
PORT=8080
MONGO_URL=mongodb://localhost:27017/adoptme
```

## Ejecucion

```bash
npm start
```

Para desarrollo con recarga automatica:

```bash
npm run dev
```

## Endpoints

### Mocks

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/mocks/mockingpets` | Genera mascotas de prueba sin guardarlas. Acepta `?quantity=` (por defecto 100). |
| GET | `/api/mocks/mockingusers` | Genera usuarios de prueba sin guardarlos. Acepta `?quantity=` (por defecto 50). |
| POST | `/api/mocks/generateData` | Genera e inserta registros en la base. Recibe `{ "users": number, "pets": number }`. |

Los usuarios generados usan la contraseña `coder123` encriptada con bcrypt, el rol varia entre `user` y `admin`, y el campo `pets` se devuelve como un array vacio.

Ejemplo:

```bash
curl -X POST http://localhost:8080/api/mocks/generateData \
  -H "Content-Type: application/json" \
  -d "{\"users\":20,\"pets\":10}"
```

Los registros insertados se pueden comprobar con `GET /api/users` y `GET /api/pets`.

### Resto de la API

| Metodo | Ruta |
| --- | --- |
| GET / PUT / DELETE | `/api/users` |
| GET / POST / PUT / DELETE | `/api/pets` |
| GET / POST | `/api/adoptions` |
| POST | `/api/sessions` |
