from django.test import TestCase

from planit_data.models import CommunitySystem, DefaultRisk, WeatherEvent


class DefaultRiskManager(TestCase):
    def test_top_risks(self):
        WeatherEvent.objects.bulk_create([
            WeatherEvent(name="Hail"),
            WeatherEvent(name="Rain"),
            WeatherEvent(name="Sleet"),
            WeatherEvent(name="Snow"),
        ])
        CommunitySystem.objects.bulk_create([
            CommunitySystem(name="Roads"),
            CommunitySystem(name="Bridges"),
            CommunitySystem(name="Airports"),
            CommunitySystem(name="Canals"),
        ])

        weather_events = {we.name: we for we in WeatherEvent.objects.all()}
        community_systems = {cs.name: cs for cs in CommunitySystem.objects.all()}

        default_risks = DefaultRisk.objects.bulk_create([
            DefaultRisk(weather_event=weather_events['Hail'],
                        community_system=community_systems['Roads'], order=1),
            DefaultRisk(weather_event=weather_events['Hail'],
                        community_system=community_systems['Bridges'], order=2),
            DefaultRisk(weather_event=weather_events['Rain'],
                        community_system=community_systems['Roads'], order=1),
            DefaultRisk(weather_event=weather_events['Sleet'],
                        community_system=community_systems['Roads'], order=1),
            DefaultRisk(weather_event=weather_events['Sleet'],
                        community_system=community_systems['Bridges'], order=2),
            DefaultRisk(weather_event=weather_events['Snow'],
                        community_system=community_systems['Bridges'], order=1),
            DefaultRisk(weather_event=weather_events['Snow'],
                        community_system=community_systems['Canals'], order=2),
        ])

        starting_risks = DefaultRisk.objects.top_risks(
            [weather_events['Hail'].id, weather_events['Sleet'].id, weather_events['Snow'].id],
            [community_systems['Roads'].id, community_systems['Bridges'].id],
            4
        )

        self.assertEqual(starting_risks, [
            default_risks[0], default_risks[1], default_risks[3], default_risks[5]
        ])
