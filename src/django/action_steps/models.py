import uuid

from django.db import models


class ActionCategoryManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class ActionCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    icon = models.CharField(max_length=255,
                            default='icon-circle-empty',
                            help_text='CSS icon class to apply to HTML elements that ' +
                                      'describe this category')
    description = models.CharField(max_length=1024, blank=True, default='')

    objects = ActionCategoryManager()

    def __str__(self):
        return self.name

    def natural_key(self):
        return (self.name,)

    class Meta:
        ordering = ['name']


class ActionType(models.Model):

    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

    def natural_key(self):
        return (self.name,)

    class Meta:
        ordering = ['name']


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

    class Meta:
        ordering = ['name']
