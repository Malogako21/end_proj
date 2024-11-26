
from django.urls import path, include
from api.views import (login_view, logout_view, TaskAPIList, TaskAPIUpdate, TaskAPIDestroy, TaskAPICreate,)
from wwwroot import settings

urlpatterns = [
    # вход - выход на сайт
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),

    # API
    path('v1/task/', TaskAPIList.as_view()), # список записей
    path('v1/taskcreate/', TaskAPICreate), # создание записи
    path('v1/task/<int:pk>/', TaskAPIUpdate), # обновление записи
    path('v1/taskdelete/<int:pk>/', TaskAPIDestroy), # удаление записи
]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns = [
                      path('__debug__/', include(debug_toolbar.urls)),
                  ] + urlpatterns
