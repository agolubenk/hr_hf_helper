**HR HELPER - ДЕТАЛЬНЫЙ ПЛАН ДЕЙСТВИЙ**

**Комплексное руководство по исправлению и улучшению системы**

**Дата создания:** 28.10.2025 **Версия:** 1.0

**Статус:** Ready for Implementation

**Оглавление**

1. Анализ текущего состояния
1. Фаза 1: Критические исправления
1. Фаза 2: Планируемые улучшения
1. Фаза 3: Долгосрочные улучшения
1. План тестирования
1. Метрики успеха

**Анализ текущего состояния {#анализ}**

**Работающие компоненты**

Система HR Helper включает следующие **работающие** компоненты:

- **AJAX обработка чата** - реализована через chat aj axhandl er в vi ews. py
- **Определение типа команды** - det er mi ne\_act i on\_t ype\_f r om\_t ext ( ) корректно распознает команды

![ref1] **Создание записей** - HRScreening и Invite через Django формы функционируют ![ref1] **Интеграция с Huntflow** - через модели и API сервисы работает стабильно

![ref1] **Google Calendar/Drive** - создание событий и документов выполняется успешно ![ref1] **ChatMessage** - сохранение в БД с различными типами сообщений

**Критические проблемы**

**Проблема №1: Слоты не генерируются**

**Локация:** vacancy- sl ot s. j s **Симптомы:**

- Слоты не отображаются на странице
- Кнопки копирования слотов неактивны
- Console errors: "calendarEvents is not defined"
- Пустые секции текущей и следующей недели

**Причины:**

![ref1] Неправильный порядок загрузки JavaScript файлов

![ref1] Глобальные переменные (cal endar Event s, vacancyDat a, sl ot sSet t i ngs) недоступны при

инициализации

- Функция i ni t i al i zeSl ot s( ) вызывается до полной загрузки данных
- Отсутствие валидации доступности данных перед генерацией

**Критичность:** P0 (блокирует базовую функциональность)

**Проблема №2: AJAX чат перезагружает страницу**

**Локация:** chat \_act i ons. j s, vi ews. py: : chat aj axhandl er **Симптомы:**

![ref1] После отправки сообщения страница полностью перезагружается ![ref1] История чата теряется при отправке

![ref1] Пользовательский опыт нарушен

**Причины:**

- Функция r el oadChat ( ) явно вызывает wi ndow. l ocat i on. r el oad( )
- Backend не возвращает HTML нового сообщения в JSON response
- Отсутствует функция динамического добавления сообщений в DOM

**Критичность:** P0 (критический UX issue)

**Статус:** Решение задокументировано в предыдущей инструкции

**Проблема №3: Неверный подсчет встреч**

**Локация:** vacancy- sl ot s. j s: : cal cul at eAvai l abl eSl ot s( ) **Симптомы:**

![ref1] Badge отображает неправильное количество встреч ![ref1] "Обеды" учитываются как встречи

![ref1] События "весь день" включены в подсчет **Причины:**

- Неточная фильтрация событий типа lunch/обед
- Badge показывает количество слотов вместо встреч
- Логика подсчета не синхронизирована с отображением

**Критичность:** P1 (влияет на точность данных)

**Проблема №4: Медленный парсер времени**

**Локация:** enhanced\_dat et i me\_par ser . py **Симптомы:**

![ref1] Обработка команды / i n занимает >3 секунды ![ref1] Пользователь ждет ответа системы

![ref1] Негативный impact на UX

**Причины:**

- Отсутствие кеширования результатов парсинга
- Повторная компиляция регулярных выражений при каждом вызове
- Неоптимальные алгоритмы поиска

**Критичность:** P1 (влияет на производительность)

**Фаза 1: Критические исправления {#фаза-1}**

**Срок:** 1-2 недели

**Цель:** Устранить все P0 и P1 проблемы

**Шаг 1: Исправление генерации слотов Задача 1.1: Правильная загрузка скриптов**

**Файл:** chat \_wor kf l ow. ht ml

**Решение:** Реорганизация порядка загрузки

&l t ; scr i pt  i d="sl ot s- set t i ngs- dat a"  t ype="appl i cat i on/ j son"&gt ;  ![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.002.png)    {{  sl ot s\_set t i ngs\_j son| saf e  }}

&l t ; / scr i pt &gt ;

&l t ; scr i pt  i d="vacancy- dat a"  t ype="appl i cat i on/ j son"&gt ;      {{  vacancy\_dat a\_j son| saf e  }}

&l t ; / scr i pt &gt ;

&l t ; scr i pt  i d="cal endar - event s- dat a"  t ype="appl i cat i on/ j son"&gt ;      {{  cal endar \_event s\_j son| saf e  }}

&l t ; / scr i pt &gt ;

&l t ; scr i pt &gt ;![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.003.png)

`     `wi ndow. sl ot sSet t i ngs  =  nul l ;

`     `wi ndow. vacancyDat a  =  nul l ;

`     `wi ndow. cal endar Event s  =  nul l ;

`     `wi ndow. sessi onI d  =  "{{  chat \_sessi on. i d  }}";

`     `wi ndow. user Wor kHour s  =  {{  user \_wor k\_hour s\_j son| saf e  }};

`     `wi ndow. user Meet i ngI nt er val  =  {{  user \_meet i ng\_i nt er val | def aul t : 15  }}; &l t ; / scr i pt &gt ;

&l t ; scr i pt  sr c="{% st at i c  ' j s/ vacancy- sl ot s. j s'  %}"  def er &gt ; &l t ; / scr i pt &gt ; &l t ; scr i pt  sr c="{% st at i c  ' j s/ copy- but t ons. j s'  %}"  def er &gt ; &l t ; / scr i pt &gt ; &l t ; scr i pt  sr c="{% st at i c  ' j s/ chat \_act i ons. j s'  %}"  def er &gt ; &l t ; / scr i pt &gt ;

&l t ; scr i pt  def er &gt ;

`     `document . addEvent Li st ener ( ' DOMCont ent Loaded' ,  f unct i on( )  {

`         `/ /  Парсинг  JSON  данных

`         `const  sl ot sEl  =  document . get El ement ByI d( ' sl ot s- set t i ngs- dat a' ) ;

`         `i f  ( sl ot sEl )  wi ndow. sl ot sSet t i ngs  =  JSON. par se( sl ot sEl . t ext Cont ent ) ;

const  vacancyEl  =  document . get El ement ByI d( ' vacancy- dat a' ) ;

i f  ( vacancyEl )  wi ndow. vacancyDat a  =  JSON. par se( vacancyEl . t ext Cont ent ) ;

`         `const  event sEl  =  document . get El ement ByI d( ' cal endar - event s- dat a' ) ;          i f  ( event sEl )  {

`             `wi ndow. cal endar Event s  =  JSON. par se( event sEl . t ext Cont ent ) ;

`         `}  el se  {

`             `wi ndow. cal endar Event s  =  [ ] ;

`         `}

`         `/ /  Запуск  инициализации

`         `i f  ( t ypeof  i ni t i al i zeSl ot s  ===  ' f unct i on' )  {              i ni t i al i zeSl ot s( ) ;

`         `}

`     `}) ;

&l t ; / scr i pt &gt ;

**Эффект:** Данные гарантированно доступны перед инициализацией слотов

**Задача 1.2: Улучшенная initializeSlots()**

**Файл:** vacancy- sl ot s. j s **Ключевые изменения:**

- Полная валидация данных перед генерацией
- Детальное логирование для отладки
- Graceful degradation при отсутствии данных
- Проверка наличия DOM элементов

**Пример кода:**

f unct i on  i ni t i al i zeSl ot s( )  {![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.004.png)

`     `consol e. l og( '    [ I NI T]  Начало  инициализации  слотов' ) ;

`     `/ /  Валидация  данных

`     `i f  ( ! wi ndow. cal endar Event s)  {

`         `consol e. war n( ' ⚠  cal endar Event s  не  определены' ) ;          wi ndow. cal endar Event s  =  [ ] ;

`     `}

`     `i f  ( ! Ar r ay. i sAr r ay( wi ndow. cal endar Event s) )  {

`         `consol e. er r or ( ' ❌  cal endar Event s  не  массив! ' ) ;          wi ndow. cal endar Event s  =  [ ] ;

`     `}

`     `/ /  Проверка  DOM

`     `const  sect i ons  =  {

`         `cur r ent :  document . quer ySel ect or ( ' . week- sect i on. cur r ent - week' ) ,          next :  document . quer ySel ect or ( ' . week- sect i on. next - week' )

`     `};

`     `i f  ( ! sect i ons. cur r ent  | |  ! sect i ons. next )  {

`         `consol e. er r or ( ' ❌  Секции  слотов  не  найдены! ' ) ;          r et ur n;

`     `}

/ /  Генерация  и  отображение

const  cur r ent Sl ot s  =  gener at eWeekSl ot s( 0) ; const  next Sl ot s  =  gener at eWeekSl ot s( 1) ;

updat eSl ot sDi spl ay( cur r ent Sl ot s,  next Sl ot s) ; updat eLast Updat eTi me( ) ;

`     `consol e. l og( ' ✅  [ I NI T]  Инициализация  завершена' ) ; }

**Эффект:** Стабильная генерация слотов с информативными логами

**Задача 1.3: Backend сериализация**

**Файл:** vi ews. py

**Функция:** chat wor kf l ow( r equest ) **Ключевые изменения:**

- Правильная сериализация календарных событий
- JSON-формат всех данных
- Обработка исключений при загрузке календаря

**Пример кода:**

i mpor t  j son![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.005.png)

f r om  dat et i me  i mpor t  dat et i me,  t i medel t a

def  chat wor kf l ow( r equest ) :

- . . .  получение  пользователя,  вакансии,  чата  . . .
- Загрузка  календарных  событий

`     `cal endar \_event s  =  [ ]

`     `t r y:

`         `oaut h\_ser vi ce  =  Googl eOAut hSer vi ce( user )

`         `oaut h\_account  =  oaut h\_ser vi ce. get \_oaut h\_account ( )

`         `i f  oaut h\_account :

`             `cal endar \_ser vi ce  =  Googl eCal endar Ser vi ce( oaut h\_ser vi ce)              st ar t \_dat e  =  dat et i me. now( )

`             `end\_dat e  =  st ar t \_dat e  +  t i medel t a( days=14)

`             `event s  =  cal endar \_ser vi ce. get \_event s(                  oaut h\_account , 

`                 `t i me\_mi n=st ar t \_dat e,

`                 `t i me\_max=end\_dat e

`             `)

`             `f or  event  i n  event s:

`                 `cal endar \_event s. append( {

- i d' :  event . get ( ' i d' ) ,
- t i t l e' : event . get ( ' summar y' , ' Без названия' ) ,
- st ar t ' : event . get ( ' st ar t ' , {}) . get ( ' dat eTi me' ) or 

`                             `event . get ( ' st ar t ' ,  {}) . get ( ' dat e' ) ,

- end' :  event . get ( ' end' ,  {}) . get ( ' dat eTi me' )  or 

`                           `event . get ( ' end' ,  {}) . get ( ' dat e' ) ,

- i sal l day' :  ' dat e'  i n  event . get ( ' st ar t ' ,  {}) ,

`                 `})

`     `except  Except i on  as  e:

`         `pr i nt ( f "❌  Ошибка  загрузки  календаря:  {e}")

- Контекст  с  JSON  данными

`     `cont ext  =  {

- sl ot s\_set t i ngs\_j son' :  j son. dumps( sl ot s\_set t i ngs. t o\_di ct ( ) ) ,
- vacancy\_dat a\_j son' :  j son. dumps( vacancy\_dat a) ,
- cal endar \_event s\_j son' : j son. dumps( cal endar \_event s) ,
- user \_wor k\_hour s\_j son' : j son. dumps( user \_wor k\_hour s) ,
- user \_meet i ng\_i nt er val ' :  user \_meet i ng\_i nt er val ,

`     `}

r et ur n  r ender ( r equest ,  ' googl eoaut h/ chat \_wor kf l ow. ht ml ' ,  cont ext )

**Эффект:** Корректная передача данных от backend к frontend

**Шаг 2: Свитчер Интервью/Скрининг Задача 2.1: HTML UI свитчера**

**Добавить в Блок 1 страницы:**

<di v>![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.006.png)

`     `<di v>

`         `<di v>

`             `&l t ; l abel  cl ass="f or m- l abel  f w- bol d  mb- 2"&gt ;

`                 `&l t ; i  cl ass="f as  f a- t asks  me- 2"&gt ; &l t ; / i &gt ; Тип  встречи              &l t ; / l abel &gt ;

`             `<di v>

`                 `&l t ; i nput  t ype="r adi o"  cl ass="bt n- check"  name="meet i ngType" 

`                        `i d="t ypeScr eeni ng"  val ue="scr eeni ng"  checked&gt ;

`                 `&l t ; l abel  cl ass="bt n  bt n- out l i ne- success"  f or ="t ypeScr eeni ng"&gt ;

`                     `&l t ; i  cl ass="f as  f a- cl i pboar d- l i st  me- 2"&gt ; &l t ; / i &gt ; Скрининг                  &l t ; / l abel &gt ;

`                 `&l t ; i nput  t ype="r adi o"  cl ass="bt n- check"  name="meet i ngType" 

`                        `i d="t ypeI nt er vi ew"  val ue="i nt er vi ew"&gt ;

`                 `&l t ; l abel  cl ass="bt n  bt n- out l i ne- pr i mar y"  f or ="t ypeI nt er vi ew"&gt ;                      &l t ; i  cl ass="f as  f a- user s  me- 2"&gt ; &l t ; / i &gt ; Интервью

`                 `&l t ; / l abel &gt ;

`             `</ di v>

`             `&l t ; smal l  cl ass="t ext - mut ed  d- bl ock  mt - 2"&gt ;

`                 `&l t ; i  cl ass="f as  f a- i nf o- ci r cl e  me- 1"&gt ; &l t ; / i &gt ;                  <span>

`                     `Скрининг:  40- 60  мин,  интервью:  60- 90  мин

`                 `</ span>

`             `&l t ; / smal l &gt ;

`         `</ di v>

`     `</ di v>

</ di v>

**Эффект:** Визуальный интерфейс для выбора типа встречи

**Задача 2.2: JavaScript логика**

**Новый файл:** meet i ng- t ype- swi t cher . j s **Функциональность:**

- Отслеживание текущего типа встречи
- Обновление длительности при смене типа
- Пересчет слотов
- Custom events для интеграции с другими модулями

**Основная логика:**

const  MEETI NG\_CONFI G  =  {![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.007.png)

`     `scr eeni ng:  {

`         `def aul t Dur at i on:  60,

`         `i nf o:  ' Скрининг:  40- 60  мин'      },

`     `i nt er vi ew:  {

`         `def aul t Dur at i on:  90,

`         `i nf o:  ' Интервью:  60- 90  мин'      }

};

f unct i on  handl eMeet i ngTypeChange( newType)  {      const  conf i g  =  MEETI NG\_CONFI G[ newType] ;

`     `/ /  Обновить  vacancyDat a

`     `i f  ( wi ndow. vacancyDat a)  {

`         `wi ndow. vacancyDat a. dur at i on  =  conf i g. def aul t Dur at i on;      }

`     `/ /  Пересчитать  слоты

`     `i f  ( t ypeof  i ni t i al i zeSl ot s  ===  ' f unct i on' )  {          i ni t i al i zeSl ot s( ) ;

`     `}

`     `/ /  Di spat ch  event

`     `document . di spat chEvent ( new  Cust omEvent ( ' meet i ngTypeChanged' ,  {          det ai l :  {  t ype:  newType,  dur at i on:  conf i g. def aul t Dur at i on  }      }) ) ;

}

**Эффект:** Динамическая смена типа встречи без перезагрузки

**Шаг 3: Исправление подсчета встреч**

**Задача 3.1: Улучшенный generateWeekSlots()**

**Ключевые изменения:**

![ref1] Правильная фильтрация событий (исключение обедов, событий "весь день") ![ref1] Точный подсчет рабочих встреч

![ref1] Детальное логирование процесса

**Логика фильтрации:**

const  meet i ngsWi t hout Lunch  =  dayEvent s. f i l t er ( event  =&gt ;  {  ![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.008.png)    const  t i t l e  =  event . t i t l e. t oLower Case( ) ;

`     `/ /  Исключаем  обеды

`     `const  i sLunch  =  t i t l e. i ncl udes( ' обед' )  | |                     t i t l e. i ncl udes( ' l unch' ) ;

`     `i f  ( i sLunch)  r et ur n  f al se;

/ /  Исключаем  "весь  день"![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.009.png)

i f  ( event . i sal l day)  r et ur n  f al se;

`     `/ /  Исключаем  нерабочие  события

`     `const  i sNonWor ki ng  =  t i t l e. i ncl udes( ' отпуск' )  | |                          t i t l e. i ncl udes( ' vacat i on' ) ;

`     `i f  ( i sNonWor ki ng)  r et ur n  f al se;

`     `r et ur n  t r ue; }) ;

meet i ngsCount  =  meet i ngsWi t hout Lunch. l engt h;

**Эффект:** Точный подсчет рабочих встреч в badge

**Задача 3.2: Улучшенный createSlotCard()**

**Добавление badge для встреч:**

const  meet i ngsBadge  =  sl ot . meet i ngsCount  &gt ;  0  ? ![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.010.png)

- <span>

`         `&l t ; i  cl ass="f as  f a- cal endar - check  me- 1"&gt ; &l t ; / i &gt ;          ${sl ot . meet i ngsCount }

`      `</ span>`  :  ' ' ;

**Эффект:** Визуальное отображение количества встреч в день

**Шаг 4: Оптимизация парсера времени Задача 4.1: Кеширование и предкомпиляция**

**Ключевые улучшения:**

1. **LRU кеширование** - кеш последних 1024 результатов
1. **Предкомпиляция регулярок** - компиляция один раз при инициализации
1. **Быстрая предпроверка** - раннее отсеивание нерелевантного текста

**Пример оптимизации:**

f r om  f unct ool s  i mpor t  l r u\_cache![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.011.png)

cl ass  EnhancedDat eTi mePar ser :

`     `def  \_\_i ni t \_\_( sel f ) :

`         `sel f . \_compi l ed\_pat t er ns  =  {}          sel f . \_pr ecompi l e\_pat t er ns( )

`     `def  \_pr ecompi l e\_pat t er ns( sel f ) :

`         `sel f . \_compi l ed\_pat t er ns[ ' t i me' ]  =  [

`             `r e. compi l e( r ' ( \ d{1, 2}) : ( \ d{2}) ' ,  r e. I GNORECASE) ,![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.012.png)

- . . .  другие  паттерны

`         `]

`     `@l r u\_cache( maxsi ze=1024)

`     `def  par se( sel f ,  t ext :  st r )  - &gt ;  Opt i onal [ dat et i me] :          i f  not  sel f . \_has\_t i me\_mar ker s( t ext ) :

`             `r et ur n  None

- . . .  основная  логика

`     `def  \_has\_t i me\_mar ker s( sel f ,  t ext :  st r )  - &gt ;  bool :

`         `mar ker s  =  [ ' : ' ,  ' ч' ,  ' час' ,  ' 2025' ,  ' понедельник' ]

`         `t ext \_l ower  =  t ext . l ower ( )

`         `r et ur n  any( mar ker  i n  t ext \_l ower  f or  mar ker  i n  mar ker s)

**Эффект:** Ускорение парсинга в 5-10 раз

**Фаза 2: Планируемые улучшения {#фаза-2}**

**Срок:** 2-4 недели после Фазы 1

**Команда /del - Система отката**

**Компоненты:**

- State snapshot service для каждого пользователя/чата
- Rollback механизм для Huntflow
- UI отображения отмененных изменений

**Формат сообщения:**

❌  Отменено:  HR- скрининг Кандидат:![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.013.png)  Иванов  Иван Вакансия:  Fr ont end  Engi neer

Изменения:

- Грейд:  Mi ddl e  →  ( удалено)
- Зарплата:  2000  USD  →  ( удалено)
- Статус  в  Hunt f l ow:  откачен

**Команда /t - Техническое интервью**

**Отличия от /in:**

- Без создания scorecard
- Другие временные правила (60-90 мин)
- Подтягивание предыдущих участников
- Отображение текущего статуса из Huntflow

**Улучшение системы уведомлений**

**Замена alert() на:**

- Toast-уведомления (Bootstrap или custom)
- Прогресс-индикаторы для длительных операций
- Анимации появления/исчезновения

**Пример toast:**

f unct i on  showToast ( message,  t ype  =  ' success' )  {![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.014.png)

`     `const  t oast  =  document . cr eat eEl ement ( ' di v' ) ;

`     `t oast . cl assName  =  ` t oast - not i f i cat i on  al er t  al er t - ${t ype}` ;      t oast . t ext Cont ent  =  message;

`     `document . body. appendChi l d( t oast ) ;

`     `set Ti meout ( ( )  =&gt ;  t oast . cl assLi st . add( ' show' ) ,  100) ;      set Ti meout ( ( )  =&gt ;  {

`         `t oast . cl assLi st . r emove( ' show' ) ;

`         `set Ti meout ( ( )  =&gt ;  t oast . r emove( ) ,  300) ;

`     `},  5000) ;

}

**Фаза 3: Долгосрочные улучшения {#фаза-3}**

**Срок:** 1-3 месяца

**AI-назначение интервьюеров**

**Факторы анализа:**

- Специализация кандидата vs экспертиза интервьюера
- Загруженность интервьюеров (календарь)
- Предыдущий опыт интервьюирования
- Временные предпочтения команды

**Алгоритм:**

1. Анализ профиля кандидата (технологии, опыт)
1. Поиск интервьюеров с подходящей экспертизой
1. Проверка загруженности через Google Calendar API
1. Ранжирование по score: экспертиза × доступность
1. Автоматическое предложение топ-3

**Интеграция с календарями интервьюеров**

**Функциональность:**

- Проверка свободных слотов в календарях команды
- Автоматическое предложение оптимального времени
- Синхронизация с Outlook, Google Calendar

**API интеграция:**

![ref1] Google Calendar API (уже есть)

![ref1] Microsoft Graph API (для Outlook) ![ref1] CalDAV протокол (универсальный)

**Аналитика и метрики**

**Dashboards:**

1. **Производительность:**
- Среднее время обработки команд
- Количество созданных скринингов/интервью
- Success rate операций
2. **HR метрики:**
- Конверсия по грейдам
- Time-to-hire
- Эффективность рекрутеров
3. **Технические метрики:**
- API response times
- Error rates
- Cache hit rates

**План тестирования {#тестирование}**

**Тестирование Фазы 1 Неделя 1: Слоты**

**Чеклист:**

![ref1] [ ] Слоты генерируются для текущей недели

![ref1] [ ] Слоты генерируются для следующей недели ![ref1] [ ] calendarEvents загружаются корректно

- [ ] Кнопки копирования активны при наличии слотов
- [ ] Кнопки неактивны при отсутствии слотов
- [ ] Нет ошибок в консоли браузера
- [ ] Обновление слотов работает

**Тест-кейсы:**

1. Пустой календарь → все слоты свободны
1. Полностью занятый календарь → нет слотов
1. Частично занятый → корректные интервалы
1. С обедами → обеды исключены из подсчета

**Неделя 2: Свитчер**

**Чеклист:**

![ref1] [ ] Свитчер отображается корректно

![ref1] [ ] Переключение меняет тип встречи

![ref1] [ ] Слоты пересчитываются после смены ![ref1] [ ] Длительность обновляется корректно ![ref1] [ ] Info текст меняется

![ref1] [ ] Event meetingTypeChanged срабатывает **Тест-кейсы:**

1. Скрининг → Интервью: длительность 60→90
1. Интервью → Скрининг: длительность 90→60
1. Смена типа пересчитывает слоты
1. Сохранение выбора при навигации (опционально)

**Неделя 3: Подсчет встреч**

**Чеклист:**

- [ ] meetingsCount точный для каждого дня
- [ ] Badge отображает правильное число
- [ ] Обеды исключены из подсчета
- [ ] События "весь день" исключены
- [ ] Нерабочие события (отпуск) исключены

**Тест-кейсы:**

1. День с 3 встречами + обед → badge показывает 3
2. День с событием "весь день" → не учитывается
2. День с отпуском → не учитывается
2. Пустой день → badge 0 или не отображается

**Неделя 4: Парсер времени**

**Чеклист:**

- [ ] Парсинг < 1 секунды
- [ ] Кеш работает (повторный парсинг мгновенный)
- [ ] Все форматы распознаются
- [ ] Некорректный ввод обрабатывается gracefully

**Тест-кейсы:**

1. "15.09.2025 14:30" → корректный datetime
1. "завтра в 14:00" → корректный datetime
1. "понедельник 15ч" → корректный datetime
1. "абракадабра" → None или ошибка

**Unit-тесты Python (backend)**

cl ass  Test EnhancedDat eTi mePar ser ( Test Case) :  ![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.015.png)    def  set Up( sel f ) :

`         `sel f . par ser  =  get \_par ser ( )

`     `def  t est \_absol ut e\_dat e\_t i me( sel f ) :

`         `r esul t  =  sel f . par ser . par se( "15. 09. 2025  14: 30")          sel f . asser t Equal ( r esul t . day,  15)

`         `sel f . asser t Equal ( r esul t . mont h,  9)

`         `sel f . asser t Equal ( r esul t . year ,  2025)

`         `sel f . asser t Equal ( r esul t . hour ,  14)

`         `sel f . asser t Equal ( r esul t . mi nut e,  30)

`     `def  t est \_r el at i ve\_dat e( sel f ) :

`         `r esul t  =  sel f . par ser . par se( "завтра  в  14: 00")          expect ed  =  dat et i me. now( )  +  t i medel t a( days=1)          sel f . asser t Equal ( r esul t . day,  expect ed. day)

`         `sel f . asser t Equal ( r esul t . hour ,  14)

`     `def  t est \_i nval i d\_i nput ( sel f ) :

`         `r esul t  =  sel f . par ser . par se( "i nval i d  t ext ")          sel f . asser t I sNone( r esul t )

def  t est \_cachi ng( sel f ) :

- Первый  вызов![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.016.png)

st ar t  =  t i me. t i me( )

sel f . par ser . par se( "15. 09. 2025  14: 30") f i r st \_cal l  =  t i me. t i me( )  -  st ar t

- Второй  вызов  ( из  кеша)

st ar t  =  t i me. t i me( )

sel f . par ser . par se( "15. 09. 2025  14: 30") second\_cal l  =  t i me. t i me( )  -  st ar t

- Должно  быть  намного  быстрее

sel f . asser t Less( second\_cal l ,  f i r st \_cal l  \*  0. 1)

**JavaScript (frontend)**

descr i be( ' Meet i ng  Type  Swi t cher ' ,  ( )  =&gt ;  {![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.017.png)

`     `bef or eEach( ( )  =&gt ;  {

`         `/ /  Set up  DOM

`         `document . body. i nner HTML  =  `

`             `&l t ; i nput  t ype="r adi o"  i d="t ypeScr eeni ng"  checked&gt ;              &l t ; i nput  t ype="r adi o"  i d="t ypeI nt er vi ew"&gt ;

`             `<span></ span>

- ;

`     `}) ;

`     `t est ( ' shoul d  i ni t i al i ze  wi t h  scr eeni ng  t ype' ,  ( )  =&gt ;  {          expect ( get Cur r ent Meet i ngType( ) ) . t oBe( ' scr eeni ng' ) ;

`     `}) ;

`     `t est ( ' shoul d  change  t o  i nt er vi ew  t ype' ,  ( )  =&gt ;  {

`         `const  i nt er vi ewRadi o  =  document . get El ement ByI d( ' t ypeI nt er vi ew' ) ;          i nt er vi ewRadi o. checked  =  t r ue;

`         `i nt er vi ewRadi o. di spat chEvent ( new  Event ( ' change' ) ) ;

`         `expect ( get Cur r ent Meet i ngType( ) ) . t oBe( ' i nt er vi ew' ) ;      }) ;

`     `t est ( ' shoul d  updat e  dur at i on  on  t ype  change' ,  ( )  =&gt ;  {          wi ndow. vacancyDat a  =  {  dur at i on:  60  };

const  i nt er vi ewRadi o  =  document . get El ement ByI d( ' t ypeI nt er vi ew' ) ; i nt er vi ewRadi o. checked  =  t r ue;

i nt er vi ewRadi o. di spat chEvent ( new  Event ( ' change' ) ) ;

`         `expect ( wi ndow. vacancyDat a. dur at i on) . t oBe( 90) ;      }) ;

}) ;

**Метрики успеха {#метрики}**

**Технические метрики Производительность**



|Метрика|Текущее|Целевое|Критерий|
| - | - | - | - |
|Время загрузки слотов|N/A|< 2 сек|P0|
|Время парсинга даты|~3-5 сек|< 1 сек|P1|
|Время отправки AJAX|~1 сек|< 500 мс|P2|
|FCP (First Contentful Paint)|?|< 1.5 сек|P2|

**Надежность**



|Метрика|Текущее|Целевое|Критерий|
| - | - | - | - |
|Успешность генерации слотов|0%|99%|P0|
|Успешность AJAX запросов|~95%|99%|P0|
|Точность подсчета встреч|~70%|100%|P1|
|Cache hit rate (парсер)|0%|>80%|P1|

**Бизнес-метрики Использование**



|Метрика|Базовая|Целевая|Период|
| - | - | - | - |
|Скринингов в день|?|+50%|1 месяц|
|Инвайтов в день|?|+30%|1 месяц|
|Активных пользователей|?|100% команды|2 месяца|
|NPS (Net Promoter Score)|?|>8/10|3 месяца|

**Эффективность**



|Метрика|До|После|Улучшение|
| - | - | - | - |
|Время на скрининг|~10 мин|~5 мин|-50%|
|Время на инвайт|~15 мин|~7 мин|-53%|
|Ошибок в данных|~5%|<1%|-80%|

**Заключение**

Данный план действий обеспечивает **систематический подход** к исправлению критических проблем и внедрению улучшений в систему HR Helper.

**Приоритеты**

**Немедленно (Фаза 1):**

1. Исправить генерацию слотов
1. Добавить свитчер типов встреч
1. Исправить подсчет встреч
1. Оптимизировать парсер времени

**Ближайшие 2-4 недели (Фаза 2):**

1. Команда / del
1. Команда / t![](Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.018.png)
1. Улучшенные уведомления

**Долгосрочно (Фаза 3):**

1. AI-функции
1. Расширенная интеграция
1. Аналитика

**Критерии успеха**

Фаза 1 считается **успешно завершенной**, когда:

![ref1] ✅ Слоты генерируются стабильно для обеих недель ![ref1] ✅ Свитчер меняет тип встречи без ошибок

![ref1] ✅ Подсчет встреч точный (100%)

![ref1] ✅ Парсер времени работает < 1 сек

![ref1] ✅ AJAX чат работает без перезагрузки

![ref1] ✅ Все unit-тесты проходят

**Следующий шаг:** Приступить к реализации Шага 1.1

[ref1]: Aspose.Words.bc6864e0-20f1-4761-af3e-10763ea15f22.001.png
