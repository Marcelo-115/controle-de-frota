from typing import Optional


def calcular_status_consumo(media_lh: Optional[float]) -> str:
    if media_lh is None:
        return "sem_dados"
    if media_lh < 3.0:
        return "economico"
    elif media_lh <= 4.0:
        return "normal"
    return "alto"


def calcular_media(litros: float, horas: float) -> Optional[float]:
    if horas <= 0:
        return None
    return round(litros / horas, 2)
