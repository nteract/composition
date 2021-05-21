
import contextlib
import time


@contextlib.contextmanager
def timing(description: str) -> None:
    start = time.perf_counter()
    yield
    ellapsed_time = time.perf_counter() - start

    print(f"{description}: {ellapsed_time:.4f}s")
