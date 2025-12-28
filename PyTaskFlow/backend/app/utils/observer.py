from typing import List, Any

class Observer:
    def update(self, event: str, data: Any):
        raise NotImplementedError

class Subject:
    def __init__(self):
        self._observers: List[Observer] = []

    def attach(self, observer: Observer):
        self._observers.append(observer)

    def detach(self, observer: Observer):
        self._observers.remove(observer)

    def notify(self, event: str, data: Any = None):
        for observer in self._observers:
            observer.update(event, data)
