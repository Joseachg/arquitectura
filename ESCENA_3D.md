# Escena 3D de la arquitectura aplicada

La página estática en `docs/index.html` representa exclusivamente el diagrama de la sección 2 de `ENTREGA_ACTIVIDAD.md`: navegador, controlador y presentación, servicio, repositorio y memoria. Los cuatro últimos componentes se señalan dentro del mismo proceso Flask.

La arquitectura se cuenta como una oficina de reservas con cuatro personajes y un archivador:

| Elemento de la escena | Componente real | Acción |
| --- | --- | --- |
| Cliente | Navegador | Lleva el formulario y recibe la respuesta |
| Recepcionista | Controlador y presentación en `app.py` | Recibe, delega y prepara la página |
| Encargada | Servicio en `servicio.py` | Valida y decide si procede la reserva |
| Archivista | Repositorio en `repositorio.py` | Consulta los datos y registra la reserva |
| Archivador | `CUPOS` y `RESERVAS` en memoria | Conserva los datos; no decide ni actúa como otro servicio |

Los personajes caminan, entregan documentos y gesticulan. El archivista se acerca al mueble y abre un cajón para consultar o guardar. Los diálogos y la explicación lateral conectan estas acciones con el código; son una metáfora didáctica, no nuevos componentes de software.

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

**Estado comprobado:** el repositorio ya es público y Pages está configurado para servir `main` desde `/docs`. Su dirección es <https://joseachg.github.io/arquitectura/>.

## Implementación y verificación

HTML, CSS y JavaScript con una escena WebGL en Three.js **0.186.1**, versión verificada en el registro npm. Los modelos se construyen con geometría dentro de `office.js`; no se descargan modelos de personajes. La biblioteca, OrbitControls y su licencia MIT están incluidos en `docs/vendor`, con archivos de esa misma versión. El sitio no necesita compilación ni un servidor Python en GitHub Pages. Las fuentes web son opcionales y todos los recursos de la escena usan rutas relativas para funcionar bajo `/arquitectura/`.

`simulation.js` conserva el recorrido del caso de uso; `scene.js` controla la interfaz y la reproducción; `office.js` construye y anima la maqueta. La pausa detiene el recorrido y los personajes, y el modo de movimiento reducido conserva los pasos sin desplazamientos animados. Si WebGL no está disponible, se muestra un aviso y se puede seguir usando el recorrido textual.

Verificación local con Chromium: cuatro escenarios completos (HTTP 201, 400, 409 y 404), cupos y reservas esperados, reproducción y pausa, reinicio, controles de cámara y ausencia de desbordamiento horizontal en escritorio (1440 px) y móvil (390 px). También se inspeccionaron capturas de ambas vistas y del archivista consultando el cajón. Se comprobó mediante capturas que los personajes se mueven, quedan congelados al pausar y reanudan la animación; se verificó también la selección de personajes y el recorrido textual en un navegador con WebGL desactivado.
