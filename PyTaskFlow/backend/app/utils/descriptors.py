from typing import Any, Type

class TaskConfigDescriptor:
    """
    Descriptor to validate task configuration parameters.
    Ensures required keys are present and types are correct.
    """
    def __init__(self, required_keys: list[str] = None):
        self.required_keys = required_keys or []
        self.name = None

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)

    def __set__(self, instance, value: Any):
        if not isinstance(value, dict):
            raise TypeError(f"'{self.name}' must be a dictionary")
        
        for key in self.required_keys:
            if key not in value:
                raise ValueError(f"Missing required config key '{key}' in '{self.name}'")
                
        instance.__dict__[self.name] = value

class TypedDescriptor:
    """
    Descriptor to enforce type checking on attributes.
    """
    def __init__(self, expected_type: Type):
        self.expected_type = expected_type
        self.name = None

    def __set_name__(self, owner, name):
        self.name = name

    def __set__(self, instance, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(f"'{self.name}' expected {self.expected_type}, got {type(value)}")
        instance.__dict__[self.name] = value

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)
