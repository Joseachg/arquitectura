"""Pruebas del caso de uso sin importar Flask ni enviar peticiones HTTP."""

import unittest

from repositorio import RepositorioReservasMemoria
from servicio import EstadoReserva, ServicioReservas


class ServicioReservasTest(unittest.TestCase):
    def setUp(self):
        self.cupos = {"almuerzo": 2}
        self.reservas = []
        self.servicio = ServicioReservas(
            RepositorioReservasMemoria(self.cupos, self.reservas)
        )

    def test_nombre_invalido_no_consume_cupo(self):
        resultado = self.servicio.reservar(" A ", "almuerzo")
        self.assertEqual(resultado.estado, EstadoReserva.NOMBRE_INVALIDO)
        self.assertEqual(self.cupos["almuerzo"], 2)
        self.assertEqual(self.reservas, [])

    def test_reserva_valida_reduce_un_cupo_y_guarda_nombre_limpio(self):
        resultado = self.servicio.reservar(" Ana ", "almuerzo")
        self.assertEqual(resultado.estado, EstadoReserva.CONFIRMADA)
        self.assertEqual(resultado.nombre, "Ana")
        self.assertEqual(self.cupos["almuerzo"], 1)
        self.assertEqual(self.reservas, [{"nombre": "Ana", "turno": "almuerzo"}])

    def test_sin_cupos_no_guarda_reserva(self):
        self.cupos["almuerzo"] = 0
        resultado = self.servicio.reservar("Ana", "almuerzo")
        self.assertEqual(resultado.estado, EstadoReserva.SIN_CUPOS)
        self.assertEqual(self.reservas, [])

    def test_turno_inexistente_no_guarda_reserva(self):
        resultado = self.servicio.reservar("Ana", "noche")
        self.assertEqual(resultado.estado, EstadoReserva.TURNO_INEXISTENTE)
        self.assertEqual(self.cupos["almuerzo"], 2)
        self.assertEqual(self.reservas, [])


if __name__ == "__main__":
    unittest.main()
