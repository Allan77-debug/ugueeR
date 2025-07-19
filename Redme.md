# Guía de Migración: De Datos Mock a Base de Datos Real (Django + React)

## Objetivo General

El objetivo de esta migración es reemplazar el sistema de datos de prueba (`mockDriverData.ts`) del frontend por una conexión a la base de datos real a través de la API de Django. Al finalizar, la aplicación deberá leer, crear y eliminar datos (Rutas, Vehículos, Viajes) de forma persistente.

Este proceso se divide en dos grandes bloques de trabajo, uno para el equipo de Backend y otro para el de Frontend.

---

## 📝 Tareas para el Equipo de Backend (Django)

**Misión:** Construir los modelos, serializadores, vistas y URLs necesarios para exponer una API RESTful que gestione los datos del conductor. La base de datos y la autenticación ya están configuradas.

### Archivos a Modificar/Crear:

- `server/route/models.py` y `serializers.py`
- `server/vehicle/models.py` y `serializers.py`
- `server/travel/models.py` y `serializers.py`
- `server/driver/views.py` y `urls.py`
- `server/config/urls.py`

### Pasos a Seguir:

#### **Paso 1: Definir los Modelos de Datos**

En cada aplicación correspondiente (`route`, `vehicle`, `travel`), es necesario definir el modelo en `models.py` para almacenar los datos en la base de datos PostgreSQL.

1.  **Modelo de Rutas (`server/route/models.py`)**

    - Debe contener campos para `startLocation` (CharField), `destination` (CharField), `startPointCoords` (dos `FloatField` o `DecimalField`, uno para latitud y otro para longitud), `endPointCoords` (igual que el anterior).
    - Es crucial que este modelo tenga una **relación `ForeignKey` con el modelo `Driver`** para saber a qué conductor pertenece cada ruta.

2.  **Modelo de Vehículos (`server/vehicle/models.py`)**

    - Debe contener campos que coincidan con la interfaz del frontend: `plate`, `brand`, `model`, `category`, `vehicleType`, `capacity`, `soat`, `tecnomechanical`.
    - También debe tener una **relación `ForeignKey` con el modelo `Driver`**.

3.  **Modelo de Viajes (`server/travel/models.py`)**
    - Este modelo es el más relacional. Debe contener campos para `price`, `departureDateTime` y `availableSeats`.
    - Necesitará una **relación `ForeignKey` con el modelo `Driver`**.
    - Necesitará una **relación `ForeignKey` con el modelo de `Route`** y otra con el modelo de **`Vehicle`** para indicar qué ruta y qué vehículo se están usando para este viaje específico.

#### **Paso 2: Crear los Serializadores**

Para cada nuevo modelo, creen un `ModelSerializer` en el archivo `serializers.py` de su respectiva app.

- **Propósito:** Convertir los objetos de los modelos de Django a formato JSON para que el frontend los pueda consumir.
- **¡Importante!** La estructura del JSON generado por estos serializadores **debe coincidir exactamente** con las interfaces definidas en el archivo del frontend `client/src/types/driver.types.ts`. La colaboración con el equipo de frontend aquí es clave.

#### **Paso 3: Construir las Vistas (API Endpoints)**

En `server/driver/views.py`, deben crear las vistas de API (usando Django Rest Framework) que manejarán las peticiones del frontend. Estas vistas deben ser **protegidas**, asegurando que un conductor solo pueda acceder y modificar sus propios datos.

Se necesitan los siguientes endpoints, organizados bajo el prefijo `/api/driver/`:

- **Para Rutas:**

  - `GET /api/driver/routes/`: Devuelve una lista de todas las rutas del conductor autenticado.
  - `POST /api/driver/routes/`: Crea una nueva ruta para el conductor autenticado.
  - `DELETE /api/driver/routes/<id>/`: Elimina una ruta específica por su ID.

- **Para Vehículos:**

  - `GET /api/driver/vehicles/`: Devuelve la lista de vehículos del conductor.
  - `POST /api/driver/vehicles/`: Registra un nuevo vehículo.
  - `DELETE /api/driver/vehicles/<id>/`: Elimina un vehículo.

- **Para Viajes:**
  - `GET /api/driver/trips/`: Devuelve la lista de viajes del conductor.
  - `POST /api/driver/trips/`: Publica un nuevo viaje.
  - `DELETE /api/driver/trips/<id>/`: Cancela un viaje.

#### **Paso 4: Configurar las URLs**

1.  En `server/driver/urls.py`, mapeen cada una de las vistas creadas en el paso anterior a una ruta específica.
2.  En el archivo principal de URLs, `server/config/urls.py`, asegúrense de que el `urls.py` de la app `driver` esté incluido, como ya se hizo para el proxy.

#### **Paso 5: Aplicar Migraciones**

Una vez definidos los modelos, no olviden ejecutar los siguientes comandos para aplicar los cambios a la base de datos:

```bash
python manage.py makemigrations
python manage.py migrate
```
