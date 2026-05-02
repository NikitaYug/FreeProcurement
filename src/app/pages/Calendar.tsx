import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, AlertTriangle, Clock, CheckCircle, Package, Calendar as CalIcon
} from 'lucide-react';
import { lots, requests } from '../data/mockData';

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday-first
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'lot' | 'request';
  diffDays: number;
  contractSigned: boolean;
  status: string;
}

function getColorClass(diffDays: number, contractSigned: boolean, status: string) {
  if (status === 'delivered') return 'bg-green-100 text-green-700 border-green-200';
  if (diffDays < 7 && !contractSigned) return 'bg-red-100 text-red-700 border-red-200';
  if (diffDays >= 7 && diffDays <= 30 && !contractSigned) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-green-100 text-green-700 border-green-200';
}

function getDotColor(diffDays: number, contractSigned: boolean, status: string) {
  if (status === 'delivered') return 'bg-green-500';
  if (diffDays < 7 && !contractSigned) return 'bg-red-500';
  if (diffDays >= 7 && diffDays <= 30 && !contractSigned) return 'bg-amber-500';
  return 'bg-green-500';
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(4); // May 2025
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  // Build events map: day -> events
  const eventsMap: Record<number, CalendarEvent[]> = {};

  lots.forEach(lot => {
    const d = new Date(lot.deliveryDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000);
      if (!eventsMap[day]) eventsMap[day] = [];
      eventsMap[day].push({
        id: lot.id,
        title: lot.number + ': ' + lot.name.substring(0, 40),
        type: 'lot',
        diffDays,
        contractSigned: lot.contractSigned,
        status: lot.status,
      });
    }
  });

  requests.filter(r => r.status === 'approved').forEach(req => {
    const d = new Date(req.desiredDeliveryDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000);
      if (!eventsMap[day]) eventsMap[day] = [];
      eventsMap[day].push({
        id: req.id,
        title: req.number + ': ' + req.name.substring(0, 40),
        type: 'request',
        diffDays,
        contractSigned: false,
        status: req.status,
      });
    }
  });

  const selectedEvents = selectedDay ? (eventsMap[selectedDay] || []) : [];

  // Legend counts
  const allEvents = Object.values(eventsMap).flat();
  const redCount = allEvents.filter(e => e.diffDays < 7 && !e.contractSigned && e.status !== 'delivered').length;
  const yellowCount = allEvents.filter(e => e.diffDays >= 7 && e.diffDays <= 30 && !e.contractSigned && e.status !== 'delivered').length;
  const greenCount = allEvents.filter(e => e.status === 'delivered' || e.diffDays > 30 || e.contractSigned).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-semibold">Календарь поставок</h1>
          <p className="text-sm text-gray-500 mt-0.5">Планирование и контроль сроков закупок</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-gray-600">Срочно ({redCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-gray-600">В работе ({yellowCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-gray-600">ОК ({greenCount})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h2 className="font-semibold text-gray-800">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`py-2.5 text-center text-xs font-semibold uppercase tracking-wide ${i >= 5 ? 'text-red-400' : 'text-gray-400'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-gray-50 bg-gray-50/50" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today && month === todayMonth && year === todayYear;
              const isSelected = day === selectedDay;
              const events = eventsMap[day] || [];
              const hasRed = events.some(e => e.diffDays < 7 && !e.contractSigned && e.status !== 'delivered');
              const hasYellow = events.some(e => e.diffDays >= 7 && e.diffDays <= 30 && !e.contractSigned && e.status !== 'delivered');
              const isWeekend = (firstDay + i) % 7 >= 5;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`min-h-[90px] border-b border-r border-gray-100 p-2 cursor-pointer transition-all
                    ${isSelected ? 'bg-blue-50 border-[#1B3F8B]/20' : isWeekend ? 'bg-gray-50/30 hover:bg-gray-50' : 'hover:bg-gray-50'}
                    ${hasRed ? 'border-l-2 border-l-red-400' : hasYellow ? 'border-l-2 border-l-amber-400' : ''}`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 ${
                    isToday ? 'bg-[#1B3F8B] text-white font-bold' :
                    isSelected ? 'bg-blue-100 text-[#1B3F8B] font-semibold' :
                    isWeekend ? 'text-red-400' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map(ev => (
                      <div key={ev.id} className={`w-full px-1.5 py-0.5 rounded text-xs border truncate flex items-center gap-1 ${getColorClass(ev.diffDays, ev.contractSigned, ev.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getDotColor(ev.diffDays, ev.contractSigned, ev.status)}`} />
                        <span className="truncate text-[10px]">{ev.type === 'lot' ? 'Лот' : 'Заявка'}</span>
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-400 px-1">+{events.length - 2} ещё</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Detail Panel */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Срочно', count: redCount, color: 'bg-red-50 border-red-200 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> },
              { label: 'В работе', count: yellowCount, color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <Clock className="w-4 h-4" /> },
              { label: 'Выполнено', count: greenCount, color: 'bg-green-50 border-green-200 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-xl font-bold">{s.count}</p>
                <p className="text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Selected Day Events */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                <CalIcon className="w-4 h-4 text-[#1B3F8B]" />
                {selectedDay ? `${selectedDay} ${MONTHS[month]}` : 'Выберите день'}
              </h3>
            </div>

            {selectedDay === null && (
              <div className="px-4 py-8 text-center text-gray-400">
                <CalIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Нажмите на день для просмотра событий</p>
              </div>
            )}

            {selectedDay !== null && selectedEvents.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Нет поставок в этот день</p>
              </div>
            )}

            {selectedEvents.length > 0 && (
              <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
                {selectedEvents.map(ev => (
                  <div key={ev.id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${getDotColor(ev.diffDays, ev.contractSigned, ev.status)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            ev.type === 'lot' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {ev.type === 'lot' ? 'Лот' : 'Заявка'}
                          </span>
                          {ev.status === 'delivered' ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Выполнено
                            </span>
                          ) : ev.diffDays < 7 && !ev.contractSigned ? (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Договор не подписан!
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Через {ev.diffDays} дн.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming deliveries */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800 text-sm">Ближайшие поставки</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {lots
                .filter(l => l.status !== 'delivered')
                .map(lot => {
                  const d = new Date(lot.deliveryDate);
                  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
                  return { lot, diff };
                })
                .sort((a, b) => a.diff - b.diff)
                .slice(0, 5)
                .map(({ lot, diff }) => (
                  <div key={lot.id} className="px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${diff < 7 && !lot.contractSigned ? 'bg-red-500' : diff <= 30 ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <p className="text-xs text-gray-700 truncate">{lot.number}</p>
                    </div>
                    <span className={`text-xs font-semibold flex-shrink-0 ${diff < 7 ? 'text-red-600' : diff <= 30 ? 'text-amber-600' : 'text-green-600'}`}>
                      {diff < 0 ? 'Просрочено' : `${diff}д`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
