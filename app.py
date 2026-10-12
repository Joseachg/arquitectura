"""Versión inicial deliberadamente sobrecargada para la práctica AIS86.

Ejecuta con: python app.py
Abre: http://127.0.0.1:5000
"""
from flask import Flask, request, render_template_string

from repositorio import RepositorioReservasMemoria
from servicio import EstadoReserva, ServicioReservas


PAGINA = """
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Reserva de menú</title></head>
<body>
  <h1>Reserva de menú</h1>
  <p>Cupos disponibles para almuerzo: {{ cupos }}</p>
  <form method="post" action="/reservar">
    <label>Nombre: <input name="nombre" required></label>
    <input type="hidden" name="turno" value="almuerzo">
    <button type="submit">Reservar</button>
  </form>
  {% if mensaje %}<p id="mensaje">{{ mensaje }}</p>{% endif %}
</body>
</html>
"""

RESPUESTAS = {
    EstadoReserva.NOMBRE_INVALIDO: (400, "Escribe un nombre de al menos 2 caracteres."),
    EstadoReserva.TURNO_INEXISTENTE: (404, "El turno no existe."),
    EstadoReserva.SIN_CUPOS: (409, "No quedan cupos."),
}


def crear_app():
    app = Flask(__name__)
    # Datos en memoria para que la práctica no requiera configurar una BD.
    app.config["CUPOS"] = {"almuerzo": 2}
    app.config["RESERVAS"] = []
    repositorio = RepositorioReservasMemoria(
        app.config["CUPOS"], app.config["RESERVAS"]
    )
    servicio = ServicioReservas(repositorio)

    @app.get("/")
    def inicio():
        return render_template_string(
            PAGINA,
            cupos=servicio.cupos_disponibles("almuerzo"),
            mensaje="",
        )

    @app.post("/reservar")
    def reservar():
        nombre = request.form.get("nombre", "")
        turno = request.form.get("turno", "")
        resultado = servicio.reservar(nombre, turno)
        if resultado.estado == EstadoReserva.CONFIRMADA:
            estado_http = 201
            mensaje = f"Reserva confirmada para {resultado.nombre}."
        else:
            estado_http, mensaje = RESPUESTAS[resultado.estado]
        return render_template_string(
            PAGINA,
            cupos=servicio.cupos_disponibles("almuerzo"),
            mensaje=mensaje,
        ), estado_http

    return app


if __name__ == "__main__":
    crear_app().run(debug=True)
