from abc import ABCMeta

class TaskRegistryMeta(ABCMeta):
    """
    Metaclass for automatically registering Task classes.
    Demonstrates Metaclass usage for registry system.
    """
    _registry = {}

    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        # Register only concrete classes that have a 'type_name' attribute
        if 'type_name' in namespace and namespace['type_name']:
            mcs._registry[namespace['type_name']] = cls
        return cls

    @classmethod
    def get_registry(mcs):
        return mcs._registry

    @classmethod
    def get_task_class(mcs, type_name):
        return mcs._registry.get(type_name)
