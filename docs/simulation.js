/* Modelo didáctico: sigue el orden real de ServicioReservas y de la ruta Flask. */
(function (root) {
  'use strict';
  const cases = {
    valid: { name: 'Ana', turn: 'almuerzo', cups: 2, status: 201, outcome: 'CONFIRMADA', message: 'Reserva confirmada para Ana.' },
    invalid: { name: 'A', turn: 'almuerzo', cups: 2, status: 400, outcome: 'NOMBRE_INVALIDO', message: 'Escribe un nombre de al menos 2 caracteres.' },
    full: { name: 'Ana', turn: 'almuerzo', cups: 0, status: 409, outcome: 'SIN_CUPOS', message: 'No quedan cupos.' },
    unknown: { name: 'Ana', turn: 'noche', cups: 2, status: 404, outcome: 'TURNO_INEXISTENTE', message: 'El turno no existe.' },
  };
  function buildScenario(key) {
    const c = cases[key];
    if (!c) throw new Error('Caso desconocido');
    const step = (from, to, title, description, extra = {}) => ({ from, to, title, description, ...extra });
    const steps = [
      step(0, 1, 'El navegador envía el formulario', `POST /reservar lleva nombre="${c.name}" y turno="${c.turn}". El navegador es el cliente; Flask recibe la petición.`),
      step(1, 2, 'El controlador delega la decisión', 'La ruta lee request.form y llama a servicio.reservar(nombre, turno). No comprueba cupos ni guarda reservas.'),
      step(2, 2, 'El servicio valida el nombre', c.name.length < 2 ? 'Después de strip(), el nombre tiene menos de dos caracteres. Devuelve NOMBRE_INVALIDO sin consultar ni guardar una reserva.' : 'El servicio limpia el nombre con strip() y comprueba que tenga al menos dos caracteres.'),
    ];
    if (key !== 'invalid') {
      steps.push(
        step(2, 3, 'El servicio consulta el turno', 'obtener_cupos(turno) delega la lectura al repositorio.'),
        step(3, 4, 'El repositorio lee la memoria', `Consulta CUPOS.get("${c.turn}"). ${key === 'unknown' ? 'Ese turno no existe: obtiene None.' : `Encuentra ${c.cups} cupos.`}`),
        step(4, 3, 'La memoria devuelve el dato', key === 'unknown' ? 'No hay una entrada para noche. La lectura no cambia los datos.' : `La lectura devuelve ${c.cups}; todavía no se modifica ningún cupo.`),
        step(3, 2, 'El servicio toma la decisión', key === 'unknown' ? 'Si cupos es None, devuelve TURNO_INEXISTENTE. No ordena guardar.' : key === 'full' ? 'Si cupos es cero o menor, devuelve SIN_CUPOS. No ordena guardar.' : 'El turno existe y quedan cupos. Se puede crear la reserva.'),
      );
    }
    if (key === 'valid') {
      steps.push(
        step(2, 3, 'El servicio ordena guardar', 'guardar_reserva("Ana", "almuerzo") se encarga de la actualización.'),
        step(3, 4, 'El repositorio actualiza los datos', 'Reduce CUPOS["almuerzo"] de 2 a 1 y agrega la reserva de Ana a RESERVAS.', { write: true }),
        step(4, 3, 'La actualización termina', 'Ahora hay un cupo y una reserva. Ambas colecciones siguen en memoria dentro del proceso Flask.'),
        step(3, 2, 'El servicio confirma la reserva', 'Devuelve ResultadoReserva(CONFIRMADA, "Ana"). El resultado no contiene códigos HTTP.'),
      );
    }
    steps.push(
      step(2, 1, 'El controlador traduce el resultado', `Recibe ${c.outcome} y lo traduce al estado HTTP ${c.status} y al mensaje de la página.`),
      // Incluso los rechazos leen los cupos de almuerzo para renderizar PAGINA.
      step(1, 2, 'El controlador prepara la vista', 'Antes de renderizar PAGINA, solicita cupos_disponibles("almuerzo") para mostrar el contador.'),
      step(2, 3, 'El servicio delega la lectura de la vista', 'La consulta para mostrar los cupos utiliza el mismo repositorio; no intenta reservar de nuevo.'),
      step(3, 4, 'El repositorio lee los cupos actuales', `Lee los cupos de almuerzo: ${key === 'valid' ? 1 : c.cups}. Esta lectura ocurre también cuando se rechazó la reserva.`),
      step(4, 3, 'La memoria responde a la consulta', 'Devuelve el contador de almuerzo, sin modificar ninguna colección.'),
      step(3, 2, 'El servicio devuelve el contador', 'cupos_disponibles entrega el dato recibido del repositorio.'),
      step(2, 1, 'Flask renderiza la página', 'render_template_string combina PAGINA, el contador de cupos y el mensaje.'),
      step(1, 0, 'El navegador muestra la respuesta', `${c.status} · ${c.message}`, { response: true }),
    );
    return { ...c, steps };
  }
  root.ReservaSimulation = { buildScenario };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ReservaSimulation;
})(typeof window !== 'undefined' ? window : globalThis);
