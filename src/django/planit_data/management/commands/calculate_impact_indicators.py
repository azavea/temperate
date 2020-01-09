import logging

from django.core.management.base import BaseCommand
from django.contrib.humanize.templatetags.humanize import intword

from planit_data.models import County, ClimateAssessmentRegion


logger = logging.getLogger('planit_data')


def calculate_asthma_impact(county):
    data = county.indicators['asthma_er_visits']
    years = sorted(int(yr) for yr in data.keys())
    if not years:
        return
    baseline_year = years[0]
    end_year = years[-1]
    baseline_value = data[str(baseline_year)]
    end_value = data[str(end_year)]
    # Conveniently/sadly there are no counties that have ever had 0 asthma ER visits
    # Thus no need to worry about a divide by 0 error here
    value = (end_value - baseline_value) / baseline_value
    county.indicators['asthma_er_visits_impact'] = {
        'baseline_year': baseline_year,
        'end_year': end_year,
        'value': value,
    }


def calculate_drought_impact(county):
    data = county.indicators['drought_duration']
    baseline_value = data['1976-1980']
    end_value = data['2011-2015']
    value = end_value - baseline_value
    county.indicators['drought_duration_impact'] = {
        'baseline_value': baseline_value,
        'end_value': end_value,
        'value': value,
    }


def calculate_coastal_flooding_impact(county):
    adaptation = county.indicators['coastal_property_damage_adaptation']
    no_adaptation = county.indicators['coastal_property_damage_no_adaptation']
    # End year chosen to match end year used in Top Hazards
    era_years = [str(yr) for yr in range(2000, 2036)]
    adaptation_sum = sum(adaptation[yr] for yr in era_years)
    no_adaptation_sum = sum(no_adaptation[yr] for yr in era_years)
    value = no_adaptation_sum - adaptation_sum

    county.indicators['coastal_property_damage_impact'] = {
        'no_adaptation_sum': intword(no_adaptation_sum),
        'adaptation_sum': intword(adaptation_sum),
        'difference': intword(value),
        'value': value,
    }


def calculate_floodzone_population(county):
    # This is already a scalar value, but it makes other code simpler for it to
    # match the shape of the other impact indicators
    data = county.indicators['fema_floodzone_population']
    county.indicators['fema_floodzone_population_impact'] = {
        'value': data
    }


def calculate_inland_flooding_impact(region):
    data = region.indicators['inland_flooding_annual_damages']
    baseline_years = [str(yr) for yr in range(2001, 2011)]
    # End years chosen to match end years used in Top Hazards
    end_years = [str(yr) for yr in range(2025, 2035)]
    baseline_value = sum(data[yr] for yr in baseline_years) / 10
    end_value = sum(data[yr] for yr in end_years) / 10
    value = end_value - baseline_value
    region.indicators['inland_flooding_annual_damages_impact'] = {
        'baseline_value': baseline_value,
        'end_value': end_value,
        'value': value,
    }


def calculate_yield_impact(region, yield_indicator):
    data = region.indicators[yield_indicator]
    region.indicators[yield_indicator + '_impact'] = {
        'value': data['2035'],
    }


class Command(BaseCommand):
    """Precalculates impact indicator values"""

    help = 'Precalculates impact indicator values'

    def handle(self, *args, **options):
        counties = County.objects.all()
        for county in counties.iterator():
            if 'asthma_er_visits' in county.indicators:
                calculate_asthma_impact(county)
            if 'drought_duration' in county.indicators:
                calculate_drought_impact(county)
            if 'coastal_property_damage_no_adaptation' in county.indicators:
                calculate_coastal_flooding_impact(county)
            if 'fema_floodzone_population' in county.indicators:
                calculate_floodzone_population(county)
            county.save()

        regions = ClimateAssessmentRegion.objects.all()
        for region in regions.iterator():
            if 'inland_flooding_annual_damages' in region.indicators:
                calculate_inland_flooding_impact(region)

            crops = ['barley', 'corn', 'cotton', 'hay', 'potato', 'rice', 'sorghum',
                     'soybean', 'wheat']
            yield_indicators = [crop + '_yields' for crop in crops]
            for yield_indicator in yield_indicators:
                if yield_indicator in region.indicators:
                    calculate_yield_impact(region, yield_indicator)

            region.save()
