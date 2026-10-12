# Escena 3D de la arquitectura aplicada

La página estática en `docs/index.html` representa exclusivamente el diagrama de la sección 2 de `ENTREGA_ACTIVIDAD.md`: navegador, controlador y presentación, servicio, repositorio y memoria. Los cuatro últimos componentes se señalan dentro del mismo proceso Flask.

## Explorar

- Arrastrar la escena gira la cámara; los botones permiten girar, acercar, alejar y restablecer la vista.
- Seleccionar un componente muestra su responsabilidad y el archivo correspondiente.
- Elegir uno de los cuatro casos y pulsar **Reproducir** anima el recorrido; **Paso** permite explicarlo lentamente. Se puede pausar, cambiar la velocidad y reiniciar.
- Los contadores cambian cuando el repositorio guarda; el código HTTP aparece cuando el navegador recibe la respuesta.

La simulación respeta el orden del código Python, incluida la consulta de los cupos de almuerzo que la ruta hace para renderizar la vista después de cualquier resultado. `Sin cupos` empieza con cero cupos; los demás casos empiezan con dos. Cada selección reinicia el estado de ese caso. La página no ejecuta Flask ni envía reservas reales.

## Vista local

Desde la raíz del proyecto:

```powershell
.\.venv\Scripts\python.exe -m http.server 8087 --bind 127.0.0.1 --directory docs
```

Abrir <http://127.0.0.1:8087>. Para detener el servidor, pulsar `Ctrl+C`.

## GitHub Pages

En el repositorio `Joseachg/arquitectura`, abrir **Settings → Pages**. En **Build and deployment**, elegir **Deploy from a branch**, rama **main**, carpeta **/docs**, y guardar. GitHub servirá los archivos estáticos de esa carpeta.

La dirección esperada es <https://joseachg.github.io/arquitectura/>. Esa dirección solo estará disponible después de publicar los archivos y completar el despliegue de Pages.

## Implementación y verificación

HTML, CSS con perspectiva y transformaciones 3D, y JavaScript sin dependencias de compilación. Las fuentes web son opcionales; si no cargan, se usan fuentes del sistema. Los enlaces a recursos son relativos para funcionar bajo `/arquitectura/`.

Verificación local con Chromium: cuatro escenarios completos (HTTP 201, 400, 409 y 404), cupos y reservas esperados, reproducción y pausa, reinicio, controles de cámara y ausencia de desbordamiento horizontal en escritorio (1440 px) y móvil (390 px). También se inspeccionaron capturas de ambas vistas. El modo de movimiento reducido evita el desplazamiento animado del mensaje y conserva el recorrido por pasos.
