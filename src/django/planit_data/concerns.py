from climate_api.wrapper import make_indicator_api_request

# Evaluate Concerns by averaging start and end values over a decade
CONCERN_YEAR_LENGTH = 10
CONCERN_START_YEAR = 1990
CONCERN_END_YEAR = 2050
CONCERN_SCENARIO = 'RCP85'


def make_range(start, length):
    return range(start, start + length)


def calculate_concern_value(concern, city_id):
    start_range = make_range(CONCERN_START_YEAR, CONCERN_YEAR_LENGTH)
    end_range = make_range(CONCERN_END_YEAR, CONCERN_YEAR_LENGTH)

    params = {
        'years': [start_range, end_range]
    }
    response = make_indicator_api_request(concern.indicator, city_id, CONCERN_SCENARIO,
                                          params=params)
    response.raise_for_status()
    data = response.json()

    return calculate_indicator_change(data, start_range, end_range, concern.is_relative)


def calculate_indicator_change(response, start_range, end_range, is_relative=False):
    """Calculate a numeric change value based on a Climate Change API Indicator response."""
    def extract_indicator_data(response, years, aggregation):
        return (response['data'][str(year)][aggregation] for year in years)

    start_vals = extract_indicator_data(response, start_range, 'avg')
    start_avg = sum(start_vals) / len(start_range)

    end_vals = extract_indicator_data(response, end_range, 'avg')
    end_avg = sum(end_vals) / len(start_range)

    difference = end_avg - start_avg
    if is_relative:
        return difference / start_avg
    else:
        return difference
