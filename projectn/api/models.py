import datetime

from django.contrib.auth.models import User
from django.db import models

"""
https://dev.to/pragativerma18/django-models-basics-and-best-practices-49e4
Лучшие практики для моделей Django:
Вот несколько рекомендаций, которые следует учитывать при разработке ваших моделей:

В приложении Django должно быть не более 5–10 моделей. 
Чем больше моделей в приложении, тем сложнее будет код.

Django определил стандартный стиль кодирования, о котором следует помнить при написании моделей. 
Он рекомендует следующий порядок полей модели:
поля базы данных
пользовательские атрибуты менеджера
Meta
def __str__()
def save()
def get_absolute_url()
пользовательские методы

1. Для именования моделей всегда используйте существительные в единственном числе, например, 
«Пользователь», «Пост», «Статья» и так далее, поскольку модель определяет свойства объекта.

2. Избегайте использования многотабличного наследования, так как оно вызывает много путаницы и увеличивает нагрузку.
Используйте явные OneToOneFields и ForeignKeys между моделями вместо многотабличного наследования, 
чтобы контролировать, когда выполняются соединения.

3. Используйте a OneToOneField вместо использования ForeignKey with unique=True.

4. Для BooleanField не используйте null=True или blank=True. 
Также стоит отметить, что для таких полей предпочтительнее задавать значения по умолчанию. 
Используйте NullBooleanField в случае, если вы понимаете, что поле может оставаться пустым.

5. Использование модели help_text в полях в качестве части документации, 
чтобы помочь другим разработчикам лучше понять структуру данных.

6. Используйте Abstract базовый класс, если вы хотите добавить общую информацию во многие другие модели. 
Это очень просто — напишите базовый класс и поместите abstract = True в Meta класс.

7. Используйте метод str в неабстрактных моделях, чтобы возвращать понятное название для ваших моделей Django.

8. Создайте TimeStampedModel для своего проекта Django, где вам нужно включить поле с датой создания 
и изменения почти во все ваши модели.

9. Не используйте null=True и blank=True, если они вам не нужны. 
Их применение часто может сбивать с толку. Учитывайте следующее:
 null=True позволяет столбцу сохранять нулевое значение.
 blank=True используется только в формах для проверки и не имеет отношения к базе данных.

Однако для TextField всегда можно безопасно задать значение по умолчанию, например пустую строку.
"""


class TimestampedModel(models.Model):
    """
       TimestampedModel в Django — это абстрактная модель, которая добавляет дополнительные поля для timestamps.
       
       Она включает следующие поля:
       time_create — DateTimeField, автоматически хранит дату и время, когда экземпляр создан;
       time_update — DateTimeField, автоматически хранит дату и время, когда экземпляр обновлён;
       time_deleted — DateTimeField, хранит дату и время, когда экземпляр удалён.
      
       Чтобы определить TimestampedModel в Django проекте, нужно:
       1. Добавить в models.py ЭТОТ КОД для определения абстрактного класса:
       2. Использовать TimestampedModel в своих моделях - просто унаследовать от неё.
          Модель, унаследованная от TimeStampedModel, автоматически получит поля created_at и updated_at.
    """
    time_create = models.DateTimeField(auto_now_add=True,
                                       db_comment="момент создания",
                                       verbose_name="Создана")
    time_update = models.DateTimeField(auto_now=True,
                                       db_comment="момент изменения",
                                       verbose_name="Изменена")

    class Meta:
        abstract = True


class Task(TimestampedModel):
    """
    Класс задачи

    title - название задачи
    content - описание задачи
    start_plan  - планируемый момент начала
    end_plan - планируемый момент окончания
    is_completed - завершено
    cat - идентификатор категории
    autor - user (пользователь) = Автор записи
    """

    title = models.CharField(max_length=255,
                             db_index=True,
                             db_comment="название задачи",
                             verbose_name="Заголовок")

    content = models.TextField(default="описание задачи",
                               db_comment="описание задачи",
                               verbose_name="Содержание")

    start_plan = models.DateTimeField(  #auto_now=True, # - так в админ-панели не будет виджета редактирования
        db_index=True,
        db_comment="планируемый момент начала",
        verbose_name="Начать")

    end_plan = models.DateTimeField(  #auto_now=True, # - так в админ-панели не будет виджета редактирования
        db_index=True,
        db_comment="планируемый момент окончания",
        verbose_name="Окончить")

    is_completed = models.BooleanField(default=False,
                                       db_comment="завершено",
                                       verbose_name="Сделана")

    # пользователь - автор записи
    author = models.ForeignKey(to=User,
                               on_delete=models.CASCADE,
                               verbose_name='Автор',
                               related_name='tasks_user',
                               )

    # Создание стандартного менеджера записей objects.
    objects = models.Manager()

    def __str__(self):
        return self.title

    class Meta:
        # для админ-панели название для таблицы приложения единственное число
        verbose_name = "Задача"
        # для админ-панели название для таблицы приложения множественное число
        verbose_name_plural = "Задачи"
        # для админ-панели сортировка
        ordering = ['-start_plan']

