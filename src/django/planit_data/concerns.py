def extract_indicator_data(response, years, aggregation):
    return (response['data'][str(year)][aggregation] for year in years)

def calculate_indicator_change(response, start_range, end_range, is_relative=False):
    """Calculate a numeric change value based on a Climate Change API Indicator reponse."""
    start_vals = extract_indicator_data(response, start_range, 'avg')
    start_avg = sum(start_vals) / len(start_range)

    end_vals = extract_indicator_data(response, end_range, 'avg')
    end_avg = sum(end_vals) / len(start_range)

    difference = end_avg - start_avg
    if is_relative:
        return difference / start_avg
    else:
        return difference
