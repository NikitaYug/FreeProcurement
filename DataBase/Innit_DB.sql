/*
Таблица Roles (Роли)
Хранит перечень ролей пользователей (Инициатор, Менеджер по закупкам, Руководитель).
Поля:
  roleId       - уникальный идентификатор роли
  name         - название роли
  permissions  - права, связанные с ролью (текстовое перечисление)
*/
CREATE TABLE Roles (
    roleId SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    permissions TEXT NOT NULL
);

/*
Таблица Departments (Отделы)
Содержит информацию о структурных подразделениях компании.
Поля:
  departmentId - уникальный идентификатор отдела
  name         - название отдела
  headUserId   - идентификатор руководителя отдела (ссылка на Users, добавляется позже)
*/
CREATE TABLE Departments (
    departmentId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    headUserId INT
);

/*
Таблица NomenclatureGroups (Номенклатурные группы)
Группирует товары/услуги по категориям.
Поля:
  groupId - уникальный идентификатор группы
  name    - название группы
*/
CREATE TABLE NomenclatureGroups (
    groupId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

/*
Таблица Nomenclature (Номенклатура)
Справочник товаров и услуг, доступных для закупки.
Поля:
  nomenclatureId - уникальный идентификатор позиции
  name           - наименование
  unit           - единица измерения
  groupId        - идентификатор группы (FK -> NomenclatureGroups)
*/
CREATE TABLE Nomenclature (
    nomenclatureId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    groupId INT NOT NULL,
    FOREIGN KEY (groupId) REFERENCES NomenclatureGroups(groupId) ON DELETE RESTRICT
);

/*
Таблица Users (Пользователи)
Учётные записи сотрудников системы.
Поля:
  userId       - уникальный идентификатор пользователя
  fullName     - полное имя
  email        - адрес электронной почты (уникальный)
  passwordHash - хеш пароля
  departmentId - идентификатор отдела (FK -> Departments)
*/
CREATE TABLE Users (
    userId SERIAL PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    departmentId INT NOT NULL,
    FOREIGN KEY (departmentId) REFERENCES Departments(departmentId) ON DELETE RESTRICT
);

-- Добавление внешнего ключа в Departments после создания Users
ALTER TABLE Departments
    ADD FOREIGN KEY (headUserId) REFERENCES Users(userId) ON DELETE SET NULL;

/*
Таблица UserRoles (Пользователи Роли)
Связь "многие ко многим" между пользователями и ролями.
Поля:
  userId - идентификатор пользователя (FK -> Users)
  roleId - идентификатор роли (FK -> Roles)
*/
CREATE TABLE UserRoles (
    userId INT NOT NULL,
    roleId INT NOT NULL,
    PRIMARY KEY (userId, roleId),
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES Roles(roleId) ON DELETE CASCADE
);

/*
Таблица BudgetItems (Статьи бюджета)
Бюджетные статьи отделов с установленными лимитами и ответственными менеджерами.
Поля:
  budgetItemId   - уникальный идентификатор статьи
  name           - название статьи
  departmentId   - идентификатор отдела (FK -> Departments)
  totalAmount    - общая сумма бюджета
  spentAmount    - израсходованная сумма
  managerId      - идентификатор менеджера, ответственного за статью (FK -> Users)
*/
CREATE TABLE BudgetItems (
    budgetItemId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    departmentId INT NOT NULL,
    totalAmount NUMERIC(15,2) NOT NULL CHECK (totalAmount >= 0),
    spentAmount NUMERIC(15,2) DEFAULT 0 CHECK (spentAmount >= 0),
    managerId INT NOT NULL,
    FOREIGN KEY (departmentId) REFERENCES Departments(departmentId) ON DELETE RESTRICT,
    FOREIGN KEY (managerId) REFERENCES Users(userId) ON DELETE RESTRICT
);

/*
Таблица Requests (Заявки)
Заявки на закупку, создаваемые инициаторами.
Поля:
  requestId    - уникальный идентификатор заявки
  authorId     - идентификатор автора (FK -> Users)
  departmentId - идентификатор отдела (FK -> Departments)
  budgetItemId - идентификатор статьи бюджета (FK -> BudgetItems)
  status       - статус заявки (Черновик, Опубликована, На согласовании, Утверждена, Отклонена)
  createdAt    - дата и время создания
  publishedAt  - дата и время публикации (заполняется при переводе из черновика)
*/
CREATE TABLE Requests (
    requestId SERIAL PRIMARY KEY,
    authorId INT NOT NULL,
    departmentId INT NOT NULL,
    budgetItemId INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Черновик' CHECK (status IN ('Черновик', 'Опубликована', 'На согласовании', 'Утверждена', 'Отклонена')),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    publishedAt TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES Users(userId) ON DELETE RESTRICT,
    FOREIGN KEY (departmentId) REFERENCES Departments(departmentId) ON DELETE RESTRICT,
    FOREIGN KEY (budgetItemId) REFERENCES BudgetItems(budgetItemId) ON DELETE RESTRICT
);

/*
Таблица RequestItems (Позиции заявки)
Строки заявки с указанием номенклатуры, количества и стоимости.
Поля:
  requestItemId   - уникальный идентификатор позиции
  requestId       - идентификатор заявки (FK -> Requests)
  nomenclatureId  - идентификатор номенклатуры (FK -> Nomenclature)
  quantity        - количество
  targetUnitPrice - целевая стоимость за единицу (может отсутствовать)
  totalPrice      - общая стоимость позиции (вычисляется автоматически)
*/
CREATE TABLE RequestItems (
    requestItemId SERIAL PRIMARY KEY,
    requestId INT NOT NULL,
    nomenclatureId INT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    targetUnitPrice NUMERIC(15,2) CHECK (targetUnitPrice >= 0),
    totalPrice NUMERIC(15,2) GENERATED ALWAYS AS (quantity * targetUnitPrice) STORED,
    FOREIGN KEY (requestId) REFERENCES Requests(requestId) ON DELETE CASCADE,
    FOREIGN KEY (nomenclatureId) REFERENCES Nomenclature(nomenclatureId) ON DELETE RESTRICT
);

/*
Таблица Lots (Лоты на закупку)
Лоты, формируемые из утверждённых заявок.
Поля:
  lotId     - уникальный идентификатор лота
  number    - номер лота (уникальный)
  formedAt  - дата формирования
  status    - статус лота (Формируется, Утверждён, Передан в тендер, Завершён)
*/
CREATE TABLE Lots (
    lotId SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    formedAt DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Формируется' CHECK (status IN ('Формируется', 'Утверждён', 'Передан в тендер', 'Завершён'))
);

/*
Таблица LotItems (Состав лота)
Связь "многие ко многим" между лотами и заявками.
Поля:
  lotItemId - уникальный идентификатор записи
  lotId     - идентификатор лота (FK -> Lots)
  requestId - идентификатор заявки (FK -> Requests)
*/
CREATE TABLE LotItems (
    lotItemId SERIAL PRIMARY KEY,
    lotId INT NOT NULL,
    requestId INT NOT NULL,
    UNIQUE (lotId, requestId),
    FOREIGN KEY (lotId) REFERENCES Lots(lotId) ON DELETE CASCADE,
    FOREIGN KEY (requestId) REFERENCES Requests(requestId) ON DELETE CASCADE
);

/*
Таблица Tenders (Тендеры)
Тендеры, объединяющие один или несколько лотов.
Поля:
  tenderId  - уникальный идентификатор тендера
  number    - номер тендера (уникальный)
  createdAt - дата создания
  status    - статус тендера (Объявлен, Завершён, Отменён)
*/
CREATE TABLE Tenders (
    tenderId SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    createdAt DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Объявлен' CHECK (status IN ('Объявлен', 'Завершён', 'Отменён'))
);

/*
Таблица TenderItems (Состав тендера)
Связь "многие ко многим" между тендерами и лотами.
Поля:
  tenderItemId - уникальный идентификатор записи
  tenderId     - идентификатор тендера (FK -> Tenders)
  lotId        - идентификатор лота (FK -> Lots)
*/
CREATE TABLE TenderItems (
    tenderItemId SERIAL PRIMARY KEY,
    tenderId INT NOT NULL,
    lotId INT NOT NULL,
    UNIQUE (tenderId, lotId),
    FOREIGN KEY (tenderId) REFERENCES Tenders(tenderId) ON DELETE CASCADE,
    FOREIGN KEY (lotId) REFERENCES Lots(lotId) ON DELETE CASCADE
);

/*
Таблица Notifications (Уведомления)
Сообщения, отправляемые пользователям о событиях в системе.
Поля:
  notificationId - уникальный идентификатор уведомления
  recipientId    - идентификатор получателя (FK -> Users)
  type           - тип уведомления (Новая заявка, Исполнение заявки, Лот сформирован, Тендер объявлен)
  message        - текст сообщения
  isRead         - признак прочтения
  createdAt      - дата и время создания
*/
CREATE TABLE Notifications (
    notificationId SERIAL PRIMARY KEY,
    recipientId INT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Новая заявка', 'Исполнение заявки', 'Лот сформирован', 'Тендер объявлен')),
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipientId) REFERENCES Users(userId) ON DELETE CASCADE
);
