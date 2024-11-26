import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse

from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from rest_framework import generics
from rest_framework.generics import CreateAPIView, get_object_or_404


from .models import Task
from .permissions import IsOwnerOrAdmin
from .serializers import TaskSerializer


# Декоратор для выдачи ошибки если пользователь неавторизован
def json_login_required(view_func):
    def wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Вы не авторизованы'}, status=401)
        return view_func(request, *args, **kwargs)

    return wrapped_view


@require_POST
def login_view(request):
    if request.method == 'POST':
        try:
            # чтение тела запроса
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if username is None or password is None:
                return JsonResponse({'detail': 'Please provide username and password.'}, status=400)

            # аутентификация пользователя - возвращение экземпляра пользователя из базы, если там есть логин+пароль
            user = authenticate(request, username=username, password=password)

            if user is None:
                return JsonResponse({'detail': 'Invalid credentials.'}, status=400)

            if user and user.is_active:
                # авторизация пользователя - установка значения входа пользователя на сайт в куках
                login(request, user)
                return JsonResponse({"status": "success", "username": username, "isauthorized": True})

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    return JsonResponse({"status": "error", "message": "Send a POST request with JSON data"}, status=400)


@json_login_required
def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'You\'re not logged in.'}, status=400)
    # стандартная функция logout() фреймворка Django
    logout(request)
    return JsonResponse({'detail': 'Successfully logged out.'})


class TaskAPIList(generics.ListAPIView):
    """
        Вернуть данные только текущего пользователя
        https://www.geeksforgeeks.org/class-based-views-django-rest-framework/
        предоставляет обработчик метода get
        и используется для конечных точек только для чтения для представления коллекции экземпляров модели.
        ListAPIView расширяет GenericAPIView и ListModelMixin.
    """
    serializer_class = TaskSerializer
    permission_classes = (IsOwnerOrAdmin,)

    def get_queryset(self):
        """ Этот вид должен возвращать список для текущего аутентифицированного пользователя. """
        user = self.request.user
        tasks = Task.objects.filter(author=user)

        return tasks


@ensure_csrf_cookie
class TaskAPICreate(CreateAPIView):
    """
    Сохранить запись в базе
    https://www.geeksforgeeks.org/class-based-views-django-rest-framework/
    предоставляет обработчик метода post
    и используется для конечных точек, предназначенных только для создания.
    CreateAPIView расширяет GenericAPIView и CreateModelMixin
    """
    serializer_class = TaskSerializer
    permission_classes = (IsOwnerOrAdmin,)

    def perform_create(self, serializer):
        author = get_object_or_404(User, id=self.request.data.get('user_id'))
        return serializer.save(author=author)

@ensure_csrf_cookie
class TaskAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsOwnerOrAdmin,)

@ensure_csrf_cookie
class TaskAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = (IsOwnerOrAdmin,)
