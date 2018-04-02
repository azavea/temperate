from bitfield import BitHandler
from rest_framework import serializers


class BitField(serializers.Field):
    """Serializes a BitField into a list of boolean key value pairs.

    To keep things simple, this serializer raises an error if any
    BitField flags aren't provided in the dict.

    """
    default_error_messages = {
        'missing_flags': 'Missing flags: {flags}',
    }

    def to_representation(self, obj):
        return {k: v for k, v in obj}

    def to_internal_value(self, data):
        model_field = getattr(self.parent.instance, self.field_name)
        valid_flags = model_field.keys()

        flags = data.keys()
        flags_set = set(flags)
        valid_flags_set = set(valid_flags)
        if valid_flags_set != flags_set:
            self.fail('missing_flags', flags=str(valid_flags_set - flags_set))

        handler = BitHandler(0, valid_flags)
        for index, flag in enumerate(valid_flags):
            handler.set_bit(index, data.get(flag, False))
        return handler
