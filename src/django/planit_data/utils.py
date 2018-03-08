import math


def apportion_counts(seq, total):
    """Divide a total into whole values for each item in a sequence as evenly as possible."""
    seq = list(seq)
    num = len(seq)
    for index, val in enumerate(seq):
        remainder = num - index
        apportion = math.ceil(total / remainder)
        yield val, apportion
        total -= apportion
