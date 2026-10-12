"""Acceso a los cupos y reservas almacenados en memoria."""


class RepositorioReservasMemoria:
    def __init__(self, cupos: dict[str, int], reservas: list[dict[str, str]]):
        self._cupos = cupos
        self._reservas = reservas

    def obtener_cupos(self, turno: str) -> int | None:
        return self._cupos.get(turno)

    def guardar_reserva(self, nombre: str, turno: str) -> None:
        self._cupos[turno] -= 1
        self._reservas.append({"nombre": nombre, "turno": turno})
