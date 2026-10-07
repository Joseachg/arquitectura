"""Versión inicial deliberadamente sobrecargada para la práctica AIS86.

Ejecuta con: python app.py
Abre: http://127.0.0.1:5000
"""
from flask import Flask, request, render_template_string


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


def crear_app():
    app = Flask(__name__)
    # Datos en memoria para que la práctica no requiera configurar una BD.
    app.config["CUPOS"] = {"almuerzo": 2}
    app.config["RESERVAS"] = []

    @app.get("/")
    def inicio():
        return render_template_string(
            PAGINA,
            cupos=app.config["CUPOS"]["almuerzo"],
            mensaje="",
        )

    @app.post("/reservar")
    def reservar():
        # CONTROLADOR SOBRECARGADO: aquí se mezclan responsabilidades.
        nombre = request.form.get("nombre", "").strip()
        turno = request.form.get("turno", "")

        # Validación de formato de la entrada.
        if len(nombre) < 2:
            return render_template_string(
                PAGINA, cupos=app.config["CUPOS"]["almuerzo"],
                mensaje="Escribe un nombre de al menos 2 caracteres.",
            ), 400

        # Búsqueda de datos / persistencia en memoria.
        cupos = app.config["CUPOS"].get(turno)
        if cupos is None:
            return render_template_string(
                PAGINA, cupos=app.config["CUPOS"]["almuerzo"],
                mensaje="El turno no existe.",
            ), 404

        # Regla del negocio: no reservar si no quedan cupos.
        if cupos <= 0:
            return render_template_string(
                PAGINA, cupos=app.config["CUPOS"]["almuerzo"],
                mensaje="No quedan cupos.",
            ), 409

        # Actualización de datos.
        app.config["CUPOS"][turno] -= 1
        app.config["RESERVAS"].append({"nombre": nombre, "turno": turno})

        # Presentación de la respuesta.
        return render_template_string(
            PAGINA,
            cupos=app.config["CUPOS"]["almuerzo"],
            mensaje=f"Reserva confirmada para {nombre}.",
        ), 201

    return app


if __name__ == "__main__":
    crear_app().run(debug=True)
