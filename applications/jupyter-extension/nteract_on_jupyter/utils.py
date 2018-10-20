import os
from contextlib import contextmanager

@contextmanager
def cmd_in_new_dir(newdir):
    cur_dir = os.getcwd()
    os.chdir(newdir)
    yield
    os.chdir(cur_dir)
