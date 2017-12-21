import uuid

from django.db import models


class CollaboratorManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class Collaborator(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)

    objects = CollaboratorManager()

    def __str__(self):
        return self.name

    def natural_key(self):
        return (self.name,)
