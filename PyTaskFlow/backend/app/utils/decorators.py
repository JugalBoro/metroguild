import functools
import logging

def with_retry(retries=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if i == retries - 1:
                        raise e
        return wrapper
    return decorator

def with_logging(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logging.info(f"Executing {func.__name__}")
        try:
            result = func(*args, **kwargs)
            logging.info(f"Finished {func.__name__}")
            return result
        except Exception as e:
            logging.error(f"Error in {func.__name__}: {e}")
            raise e
    return wrapper
