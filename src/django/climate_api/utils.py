from itertools import cycle, islice
from django.conf import settings


def get_api_url(route):
    base_url = settings.CCAPI_HOST
    return "{}/{}".format(base_url, route)


def serialize_years(years_list):
    """Process a list of year items into a string for Climate API indicator requests."""
    def parse_item(val):
        # If we were given a single int, use that directly
        if isinstance(val, int):
            return [val]
        # Otherwise it should be a range-like-object, which we can min() and max() on
        return [min(val), max(val)]

    # Parse the years_list into a sequence of year boundaries, either [year] or [min, max]
    boundaries = map(parse_item, years_list)
    # Convert the years into strings and join them with a colon, as "min:max"
    colon_delimited = (":".join(str(y) for y in val) for val in boundaries)
    # Join all the sequence items by commas
    return ",".join(colon_delimited)


def roundrobin(*iterables):
    "roundrobin('ABC', 'D', 'EF') --> A D E B F C"
    # Recipe credited to George Sakkis
    # From: https://docs.python.org/3.6/library/itertools.html#itertools-recipes
    num_active = len(iterables)
    nexts = cycle(iter(it).__next__ for it in iterables)
    while num_active:
        try:
            for next in nexts:
                yield next()
        except StopIteration:
            # Remove the iterator we just exhausted from the cycle.
            num_active -= 1
            nexts = cycle(islice(nexts, num_active))
