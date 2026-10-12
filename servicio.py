"""Caso de uso de reserva, independiente de Flask y de HTTP."""

from dataclasses import dataclass
from enum import Enum

from repositorio import RepositorioReservasMemoria


class EstadoReserva(Enum):
    NOMBRE_INVALIDO = "nombre_invalido"
    TURNO_INEXISTENTE = "turno_inexistente"
    SIN_CUPOS = "sin_cupos"
    CONFIRMADA = "confirmada"


@dataclass(frozen=True)
class ResultadoReserva:
    estado: EstadoReserva
    nombre: str = ""


class ServicioReservas:
    def __init__(self, repositorio: RepositorioReservasMemoria):
        self._repositorio = repositorio

    def cupos_disponibles(self, turno: str) -> int | None:
        return self._repositorio.obtener_cupos(turno)

    def reservar(self, nombre: str, turno: str) -> ResultadoReserva:
        nombre = nombre.strip()
        if len(nombre) < 2:
            return ResultadoReserva(EstadoReserva.NOMBRE_INVALIDO)

        cupos = self._repositorio.obtener_cupos(turno)
        if cupos is None:
            return ResultadoReserva(EstadoReserva.TURNO_INEXISTENTE)
        if cupos <= 0:
            return ResultadoReserva(EstadoReserva.SIN_CUPOS)

        self._repositorio.guardar_reserva(nombre, turno)
        return ResultadoReserva(EstadoReserva.CONFIRMADA, nombre)
