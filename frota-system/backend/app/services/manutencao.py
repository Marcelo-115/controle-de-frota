from typing import Optional


def verificar_alerta_manutencao(
    horimetro_atual: float,
    horimetro_ultima_manutencao: Optional[float],
    alerta_manutencao_horas: int,
) -> bool:
    if horimetro_ultima_manutencao is None:
        return False
    return horimetro_atual >= horimetro_ultima_manutencao + alerta_manutencao_horas


def calcular_horas_vencidas(
    horimetro_atual: float,
    horimetro_ultima_manutencao: Optional[float],
    alerta_manutencao_horas: int,
) -> float:
    if horimetro_ultima_manutencao is None:
        return 0.0
    limite = horimetro_ultima_manutencao + alerta_manutencao_horas
    if horimetro_atual >= limite:
        return round(horimetro_atual - limite, 1)
    return 0.0
