import os

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.conf import settings

FIXTURES = {
    'planit_data': [
        # Organized (filename, model_list)
        ('communitysystems.json', ['planit_data.communitysystem']),
        ('concerns.json', ['planit_data.concern']),
        ('defaultrisks.json', ['planit_data.defaultrisk']),
        ('georegions.json', ['planit_data.georegion']),
        ('indicators.json', ['planit_data.indicator']),
        ('relatedadaptivevalues.json', ['planit_data.relatedadaptivevalue']),
        ('weathereventrank.json', ['planit_data.weathereventrank']),
        ('weatherevents.json', ['planit_data.weatherevent']),
    ],
    'action_steps': [
        ('actioncategories.json', ['action_steps.actioncategory']),
        ('actiontypes.json', ['action_steps.actiontype']),
        ('collaborators.json', ['action_steps.collaborator']),
    ],
    'users': [
        ('test_organizations.json', ['users.planitorganization',
                                     'planit_data.organizationrisk',
                                     'planit_data.organizationaction'])
    ]
}


class Command(BaseCommand):
    help = 'dumps base data to fixtures'

    def handle(self, *args, **options):
        for project, output_fixtures in FIXTURES.items():
            for filename, model_list in output_fixtures:
                output_path = os.path.join(settings.BASE_DIR, project, 'fixtures', filename)
                call_command(
                    'dumpdata',
                    *model_list,
                    output=output_path,
                    indent=4,
                    natural_foreign=True
                )
