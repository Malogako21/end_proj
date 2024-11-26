from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    # ModelSerializer - позволяет не определять методы создания и обновления и не определять поля
    # HiddenField — это класс поля, который не принимает значение на основе ввода пользователя,
    # а вместо этого берет свое значение из значения по умолчанию или вызываемого объекта.

    # CurrentUserDefault() позволяет получить текущего пользователя в модели Serializer если он аутентифицирован.
    # Если нет, то будет установлено значение None.
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Task
        # поля возвращаемые клиенту
        # Если в качестве значения fields выступает строка __all__,
        # то в сериалайзере будут созданы поля для обслуживания всех полей модели,
        # кроме тех, за работу с которыми будут отвечать декларируемые поля сериалайзера.
        # Использование __all__ отменяет необходимость прописывать в fields декларируемые поля.
        fields = "__all__"

