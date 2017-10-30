from climate_api.wrapper import make_indicator_api_request

# Evaluate Concerns by averaging start and end values over a decade
CONCERN_YEAR_LENGTH = 10
CONCERN_START_YEAR = 1990
CONCERN_END_YEAR = 2050
CONCERN_SCENARIO = 'RCP85'


def make_range(start, length):
    return range(start, start + length)


def calculate_concern_value(concern, city_id):
    start_avg = get_concern_start_value(concern, city_id)
    end_avg = get_concern_end_value(concern, city_id)

    difference = end_avg - start_avg
    if concern.is_relative:
        return difference / start_avg
    else:
        return difference


def get_concern_start_value(concern, city_id):
    start_range = make_range(CONCERN_START_YEAR, CONCERN_YEAR_LENGTH)
    return get_indicator_average_value(concern, city_id, 'historical', start_range)


def get_concern_end_value(concern, city_id):
    end_range = make_range(CONCERN_END_YEAR, CONCERN_YEAR_LENGTH)
    return get_indicator_average_value(concern, city_id, CONCERN_SCENARIO, end_range)


def get_indicator_average_value(concern, city_id, scenario, timespan):
    response = make_indicator_api_request(concern.indicator, city_id, scenario,
                                          params={'years': [timespan]})
    return calculate_indicator_average_value(response.json())


def calculate_indicator_average_value(response):
    values = (result['avg'] for result in response['data'].values())
    return sum(values) / len(response['data'])
