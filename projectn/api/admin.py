from django.contrib import admin

from .models import Task


# Регистрация модели задачи в админке django для доступа к ее записям администратора
# 1. зарегистрировать этот класс в панели администратора с помощью декоратора;
@admin.register(Task)
# 2. создать класс унаследовав его от класса admin.ModelAdmin;
class TaskAdmin(admin.ModelAdmin):
    # 3. присвоить значения полям этого класса:
    # кортеж полей из таблицы, которые будут показаны
    list_display = ('id',
                    'title',
                    'start_plan',
                    'end_plan',
                    'content',
                    'is_completed',
                    'author',
                    'time_create',
                    'time_update',
                    )

    # кортеж полей которые будут кликабельны - через которые будет показан интерфейс detail для записи 
    # (для показа экрана-страницы в виде формы с полями и их значениями записи таблицы)
    list_display_links = ('id', 'title')

    # кортеж (список) полей которые можно сортировать
    # ordering = ['time_create', 'title', 'start_plan', 'end_plan', 'is_completed', 'user']
    ordering = ['time_create', 'title', 'start_plan', 'end_plan', 'is_completed', 'author']

    # кортеж (список) полей которые можно редактировать (изменять) в строке таблицы админ-панели
    list_editable = ('is_completed',)

    # кортеж (список) полей таблицы по которым будет производиться поиск (РЕГИСТРОЗАВИСИМЫЙ!) 
    # значения введенного в поле поиска админ-панели
    search_fields = ['title', 'author__username', 'content']
    # кортеж (список) полей таблицы по которым будет производиться фильтрация значения введенного в поле поиска
    # админ-панели
    list_filter = ['start_plan', 'is_completed']

    # поля только для чтения в форме редактирования
    readonly_fields = ('author',)

    def save_model(self, request, obj, form, change):
        """
         Переопределение метода сохранения модели
         для автоматической установки записи авторства текущего пользователя
         при создании записи через админ-панель
        """
        # Проверяем, что запись только создаётся
        if not change:
            # установка полю автор текущего пользователя
            obj.author = request.user
        super(TaskAdmin, self).save_model(request=request, obj=obj, form=form, change=change)


