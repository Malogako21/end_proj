import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Toolbar } from "primereact/toolbar";
import { InputTextarea } from "primereact/inputtextarea";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

import axios from "axios";
import Cookies from "universal-cookie";

import {
  FaSearch,
  FaPlus,
  FaPencilAlt,
  FaRegTrashAlt,
  FaLock,
  FaLockOpen,
  FaFileExport,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaRegCheckCircle,
} from "react-icons/fa";

import "./TasksPage.css";

export const TasksPage = () => {
  let emptyTask = {
    id: 0,
    title: "",
    content: "",
    start_plan: "",
    end_plan: "",
    is_completed: false,
  };

  const [tasks, setTasks] = useState(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [deleteTaskDialog, setDeleteTaskDialog] = useState(false);
  const [showDeleteTasksDialog, setShowDeleteTasksDialog] = useState(false);
  const [task, setTask] = useState(emptyTask);
  const [selectedTasks, setSelectedTasks] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const dt = useRef(null);
  const [lockedTasks, setLockedTasks] = useState([]);
  const [saved, setSaved] = useState(0);

  // подготовка запросов к серверу
  const cookies = new Cookies();
  const csrftoken = cookies.get("csrftoken");

  /* только такое оформление запроса принимает django - иначе отвергает из-за csrf */
  axios.defaults.withCredentials = true;

  // запрос к серверу на получение списка записей текущего пользователя
  const fetchTasksList = async () => {
    const url_value = "/api/v1/task/";

    /* только такое оформление запроса принимает django - иначе отвергает из-за csrf */
    //try {
    //const response =
    await axios({
      method: "get",
      url: url_value,
      responseType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      //});
    })
      .then((response) => {
        setTasks(modifyEndDates(response.data));
      })
      .catch(function (error) {
        "get_error", console.error(error);
      });

    // преобразовать текстовые значения дат в даты
    //setTasks(modifyEndDates(response.data));
    //} catch (err) {
    //console.log(err);
    //}
  };

  const modifyEndDates = (data) => {
    // преобразовать текстовые значения дат в даты
    return [...(data || [])].map((d) => {
      d.start_plan = new Date(d.start_plan);
      d.end_plan = new Date(d.end_plan);
      return d;
    });
  };

  // запрос к серверу на добавление новой записи
  const createTask = async (data_value) => {
    console.log("task_data", data_value);

    const url_value = "/api/v1/taskcreate/";

    await axios({
      method: "post",
      url: url_value,
      data: data_value,
      //responseType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-type": "application/json",
      },
    })
      .then((response) => {
        console.log("data", response.data);
      })
      .catch(function (error) {
        "post_error", console.error(error);
      });
  };

  // получение списка от сервера при первом рендеренге компонента
  useEffect(() => {
    // выполнение запроса к серверу
    // получение данных API
    fetchTasksList();
  }, [saved]);

  const openNew = () => {
    setTask(emptyTask);
    setSubmitted(false);
    setShowTaskDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setShowTaskDialog(false);
  };

  const hideDeleteTaskDialog = () => {
    setDeleteTaskDialog(false);
  };

  const hideDeleteTasksDialog = () => {
    setShowDeleteTasksDialog(false);
  };

  const saveTask = () => {
    setSubmitted(true);

    if (task.title.trim()) {
      // подготовка данных для запроса к серверу
      // Вам не нужно преобразовывать полезную нагрузку в строку. Axios сделает это за вас при отправке запроса.
      // https://stackforgeeks.com/blog/django-reading-array-of-json-objects-from-querydict
      // Используя JSON.stringify() на стороне JavaScript и json.loads() на стороне Django,
      // вы можете быть уверены, что данные передаются и анализируются правильно.
      let task_data = JSON.stringify(task);

      if (task.id) {
        // выполнение запроса к серверу
        // на обновление записи

        toast.current.show({
          severity: "success",
          summary: "Выполнено",
          detail: "Задача изменена",
          life: 3000,
        });
      } else {
        // выполнение запроса к серверу
        // на добавление новой записи
        if (createTask(task_data)) {
          toast.current.show({
            severity: "success",
            summary: "Выполнено",
            detail: "Задача добавлена",
            life: 3000,
          });

          /* обновление экрана */
          setSaved(saved + 1);
        } else {
          toast.current.show({
            severity: "warning",
            summary: "Ошибка выполнения запроса к серверу",
            detail: "Запись не выполнена",
            life: 3000,
          });
        }
      }

      setShowTaskDialog(false);
      setTask(emptyTask);
    }
  };

  const editTask = (task) => {
    setTask({ ...task });
    setShowTaskDialog(true);
  };

  const confirmDeleteTask = (task) => {
    setTask(task);
    setDeleteTaskDialog(true);
  };

  const deleteTask = () => {
    let _tasks = tasks.filter((val) => val.id !== task.id);

    setTasks(_tasks);
    setDeleteTaskDialog(false);
    setTask(emptyTask);
    toast.current.show({
      severity: "success",
      summary: "Выполнено",
      detail: "Задача удалена",
      life: 3000,
    });
  };

  const exportCSV = () => {
    // выгрузить в файл
    dt.current.exportCSV();
  };

  const confirmDeleteSelected = () => {
    setShowDeleteTasksDialog(true);
  };

  const deleteSelectedTasks = () => {
    /* запрос удаления записи в базе */

    /* отрисовка удаления записи в интерфейсе */
    let _tasks = tasks.filter((val) => !selectedTasks.includes(val));

    setTasks(_tasks);
    setShowDeleteTasksDialog(false);
    setSelectedTasks(null);
    toast.current.show({
      severity: "success",
      summary: "Выполнено",
      detail: "Задачи удалены",
      life: 3000,
    });
  };

  const onInputChange = (e, field) => {
    const val = (e.target && e.target.value) || "";

    let _task = { ...task };

    _task[`${field}`] = val;

    setTask(_task);
  };

  const onDateChange = (e, field) => {
    const val = e.value;
    let _task = { ...task };

    _task[`${field}`] = val;

    setTask(_task);
  };

  const onStateChange = (e) => {
    const val = e.checked ? true : false;

    let _task = { ...task };

    _task.is_completed = val;

    setTask(_task);
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="&nbsp; &nbsp; Добавить"
          tooltip="создание описания новой задачи"
          tooltipOptions={{ position: "bottom" }}
          icon={FaPlus}
          severity="success"
          onClick={openNew}
        />
        <Button
          label="&nbsp; &nbsp; Удалить все"
          tooltip="удаление отмеченных записей таблицы"
          tooltipOptions={{ position: "bottom" }}
          icon={FaRegTrashAlt}
          severity="danger"
          onClick={confirmDeleteSelected}
          disabled={!selectedTasks || !selectedTasks.length}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <Button
        label="&nbsp; &nbsp;Экспорт"
        tooltip="выгрузка всех задач в файл"
        tooltipOptions={{ position: "bottom" }}
        icon={FaFileExport}
        onClick={exportCSV}
      />
    );
  };

  const formatDate = (value) => {
    return value.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const dateStartBodyTemplate = (rowData) => {
    return formatDate(rowData.start_plan);
  };

  const dateEndBodyTemplate = (rowData) => {
    return formatDate(rowData.end_plan);
  };

  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="dd.mm.yy"
        placeholder="dd.mm.yyyy"
        mask="99/99/9999"
      />
    );
  };

  const stateBodyTemplate = (rowData) => {
    return (
      <div className="is_completed">
        {rowData.is_completed && (
          <Button
            icon={FaRegCheckCircle}
            tooltip="задача Завершена"
            tooltipOptions={{ position: "bottom" }}
            rounded
            outlined
            className="mr-2"
            severity="success"
          />
        )}
      </div>
    );
  };

  const toggleLock = (data, frozen, index) => {
    let _lockedTasks, _unlockedTasks;

    if (frozen) {
      _lockedTasks = lockedTasks.filter((c, i) => i !== index);
      _unlockedTasks = [...tasks, data];
    } else {
      _unlockedTasks = tasks.filter((c, i) => i !== index);
      _lockedTasks = [...lockedTasks, data];
    }

    _unlockedTasks.sort((val1, val2) => {
      return val1.id < val2.id ? -1 : 1;
    });

    setLockedTasks(_lockedTasks);
    setTasks(_unlockedTasks);
  };

  const actionBodyTemplate = (rowData, options) => {
    const icon = options.frozenRow ? FaLock : FaLockOpen;

    // ЗАМОРОЗКА НЕ БОЛЕЕ 5 СТРОК ТАБЛИЦЫ
    const disabled = options.frozenRow ? false : lockedTasks.length >= 5;

    return (
      <React.Fragment>
        {/* КНОПКА ЗАМОРОЗКИ СТРОКИ ТАБЛИЦЫ */}
        <Button
          icon={icon}
          tooltip="заморозка в верху таблицы текущей строки"
          tooltipOptions={{ position: "bottom" }}
          rounded
          outlined
          disabled={disabled}
          className="mr-2"
          severity="contrast"
          onClick={() =>
            toggleLock(rowData, options.frozenRow, options.rowIndex)
          }
        />
        {/* КНОПКА ИЗМЕНЕНИЯ ЗАПИСИ */}
        <Button
          icon={FaPencilAlt}
          tooltip="изменение задачи текущей строки таблицы"
          tooltipOptions={{ position: "bottom" }}
          rounded
          outlined
          className="mr-2"
          onClick={() => editTask(rowData)}
        />
        {/* КНОПКА УДАЛЕНИЯ ЗАПИСИ */}
        <Button
          icon={FaRegTrashAlt}
          tooltip="удаление задачи текущей строки таблицы"
          tooltipOptions={{ position: "bottom" }}
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDeleteTask(rowData)}
        />
      </React.Fragment>
    );
  };

  // ЗАГОЛОВОК ТАБЛИЦЫ
  const header = (
    <div className="TableHeader flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Список задач</h4>
      <IconField iconPosition="left">
        <InputIcon>
          <FaSearch />
        </InputIcon>
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Поиск..."
        />
      </IconField>
    </div>
  );

  // ПОДВАЛ ФОРМЫ ДОБАВЛЕНИЯ/ИЗМЕНЕНИЯ ЗАДАЧИ
  const taskDialogFooter = (
    <React.Fragment>
      <Button
        label="&nbsp; &nbsp;Отмена"
        icon={FaTimes}
        outlined
        onClick={hideDialog}
      />
      <Button label="&nbsp; &nbsp;Записать" icon={FaCheck} onClick={saveTask} />
    </React.Fragment>
  );

  // ПОДВАЛ ФОРМЫ УДАЛЕНИЯ ЗАДАЧИ
  const deleteTaskDialogFooter = (
    <React.Fragment>
      <Button
        label="&nbsp; &nbsp;Нет"
        icon={FaTimes}
        outlined
        onClick={hideDeleteTaskDialog}
      />
      <Button
        label="&nbsp; &nbsp;Да"
        icon={FaCheck}
        severity="danger"
        onClick={deleteTask}
      />
    </React.Fragment>
  );

  // ПОДВАЛ ФОРМЫ УДАЛЕНИЯ ВЫДЕЛЕННЫХ ЗАДАЧ
  const deleteTasksDialogFooter = (
    <React.Fragment>
      <Button
        label="&nbsp; &nbsp;Нет"
        icon={FaTimes}
        outlined
        onClick={hideDeleteTasksDialog}
      />
      <Button
        label="&nbsp; &nbsp;Да"
        icon={FaCheck}
        severity="danger"
        onClick={deleteSelectedTasks}
      />
    </React.Fragment>
  );

  return (
    <div className="container-fluid">
      {/* ОПОВЕЩЕНИЕ О РЕЗУЛЬТАТЕ ДЕЙСТВИЯ */}
      <Toast ref={toast} />

      <div className="card">
        {/* ПАНЕЛЬ ДЕЙСТВИЙ НАД ТАБЛИЦЕЙ */}
        <Toolbar
          start={leftToolbarTemplate}
          end={rightToolbarTemplate}
        ></Toolbar>

        {/* ТАБЛИЦА С ЗАПИСЯМИ */}
        <DataTable
          ref={dt}
          value={tasks}
          selection={selectedTasks}
          onSelectionChange={(e) => setSelectedTasks(e.value)}
          dataKey="id"
          /* заморозка строк */
          frozenValue={lockedTasks}
          /* изменение размеров колонок */
          resizableColumns
          columnResizeMode="fit"
          /* показ линий */
          showGridlines
          /* прокрутка содержимого таблицы */
          scrollable
          /* Функция гибкой прокрутки делает прокручиваемый раздел области просмотра динамическим, а не фиксированным, 
                          чтобы он мог увеличиваться или уменьшаться относительно родительского размера таблицы. */
          scrollHeight="flex"
          virtualScrollerOptions={{ itemSize: 100 }}
          globalFilter={globalFilter}
          header={header}
        >
          <Column selectionMode="multiple" exportable={false}></Column>
          <Column
            field="title"
            header="Название"
            sortable
            style={{ minWidth: "12rem" }}
            filter
            filterPlaceholder="поиск..."
          ></Column>
          <Column
            field="content"
            header="Описание"
            sortable
            style={{ minWidth: "16rem" }}
            filter
            filterPlaceholder="поиск..."
          ></Column>

          <Column
            field="start_plan"
            sortable
            dataType="date"
            header="Начать"
            filterField="start_plan"
            style={{ minWidth: "10rem" }}
            body={dateStartBodyTemplate}
            filter
            filterElement={dateFilterTemplate}
          ></Column>

          <Column
            field="end_plan"
            header="Окончить"
            filterField="end_plan"
            dataType="date"
            sortable
            style={{ minWidth: "10rem" }}
            body={dateEndBodyTemplate}
            filter
            filterElement={dateFilterTemplate}
          />

          <Column
            field="is_completed"
            header="Состояние"
            body={stateBodyTemplate}
            sortable
            style={{ minWidth: "12rem" }}
          ></Column>

          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
        </DataTable>
      </div>

      {/* ФОРМА ДОБАВЛЕНИЯ / ИЗМЕНЕНИЯ ЗАПИСИ */}
      <Dialog
        visible={showTaskDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Содержание задачи"
        modal
        className="p-fluid"
        footer={taskDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Название
          </label>
          <InputText
            id="title"
            value={task.title}
            onChange={(e) => onInputChange(e, "title")}
            required
            autoFocus
            className={classNames({ "p-invalid": submitted && !task.title })}
          />
          {submitted && !task.title && (
            <small className="p-error">Название - обязательное поле.</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="description" className="font-bold">
            Описание
          </label>
          <InputTextarea
            id="content"
            value={task.content}
            onChange={(e) => onInputChange(e, "content")}
            required
            rows={3}
            cols={20}
            className={classNames({ "p-invalid": submitted && !task.content })}
          />
          {submitted && !task.content && (
            <small className="p-error">Описание - обязательное поле.</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="description" className="font-bold">
            Начать
          </label>
          <Calendar
            value={task.start_plan}
            onChange={(e) => onDateChange(e, "start_plan")}
            dateFormat="dd.mm.yy"
            placeholder="dd.mm.yyyy"
            mask="99.99.9999"
            className={classNames({
              "p-invalid": submitted && !task.start_plan,
            })}
          />
          {submitted && !task.start_plan && (
            <small className="p-error">Дата начала - обязательное поле.</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="description" className="font-bold">
            Закончить
          </label>
          <Calendar
            value={task.end_plan}
            onChange={(e) => onDateChange(e, "end_plan")}
            dateFormat="dd.mm.yy"
            placeholder="dd.mm.yyyy"
            mask="99.99.9999"
            className={classNames({
              "p-invalid": submitted && !task.end_plan,
            })}
          />
          {submitted && !task.end_plan && (
            <small className="p-error">
              Дата окончания - обязательное поле.
            </small>
          )}
        </div>

        <div className="field">
          <div className="flex align-items-center">
            <Checkbox
              inputId="complited"
              name="chb__complited"
              //value="Состояние завершенности"
              onChange={onStateChange}
              checked={task.is_completed}
            />
            <label htmlFor="complited" className="ml-2">
              Состояние завершенности
            </label>
          </div>
        </div>
      </Dialog>

      {/* ФОРМА ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ТЕКУЩЕЙ ЗАПИСИ */}
      <Dialog
        visible={deleteTaskDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        icon={FaExclamationTriangle}
        header="Подтвердите"
        modal
        footer={deleteTaskDialogFooter}
        onHide={hideDeleteTaskDialog}
      >
        <div className="confirmation-content">
          {/** 
                <img src={ FaExclamationTriangle } className="mr-3" style={{ fontSize: '2rem' }} />
                */}
          <p style={{ color: "red", fontSize: "20px" }}>
            <FaExclamationTriangle />
            {task && (
              <span>
                &nbsp; &nbsp; Удалить задачу <b>{task.title}</b>?{" "}
              </span>
            )}
          </p>
        </div>
      </Dialog>

      {/* ФОРМА ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ВЫДЕЛЕННЫХ ЗАПИСЕЙ */}
      <Dialog
        visible={showDeleteTasksDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Подтвердите"
        modal
        footer={deleteTasksDialogFooter}
        onHide={hideDeleteTasksDialog}
      >
        <div className="confirmation-content">
          <p style={{ color: "red", fontSize: "20px" }}>
            <FaExclamationTriangle />
            {task && <span>&nbsp; &nbsp;Удалить выделенные задачи?</span>}
          </p>
        </div>
      </Dialog>
    </div>
  );
};
