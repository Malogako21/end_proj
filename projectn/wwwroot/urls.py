from django.contrib import admin
from django.shortcuts import render
from django.urls import path, include


# представление корневого пути сайта - запуск SPA для любого посетителя
def index_view(request):
    return render(request, 'dist/index.html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # корневой путь сайта - запуск SPA для любого посетителя
    path('', index_view, name='index'),
]
