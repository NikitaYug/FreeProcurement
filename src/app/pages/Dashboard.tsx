import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Clock, AlertTriangle, CheckCircle, FileText,
  Package, DollarSign, Zap
} from 'lucide-react';
import { budgetItems, budgetPieData, planFactData, lots, requests } from '../data/mockData';

function formatCurrency(val: number) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)} млн ₽`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)} тыс ₽`;
  return `${val.toLocaleString('ru-RU')} ₽`;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Просрочено'); return; }
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${days}д ${hrs}ч ${mins}м`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [targetDate]);
  return <span>{timeLeft}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700">{payload[0].name}</p>
        <p className="text-[#1B3F8B]">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const totalBudget = budgetItems.reduce((s, b) => s + b.annualLimit, 0);
  const totalSpent = budgetItems.reduce((s, b) => s + b.spent, 0);
  const activeRequests = requests.filter(r => r.status === 'pending').length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;

  const urgentLots = lots
    .filter(l => l.status !== 'delivered')
    .map(l => {
      const diffDays = Math.ceil((new Date(l.deliveryDate).getTime() - Date.now()) / 86400000);
      return { ...l, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 4);

  const kpiCards = [
    {
      label: 'Освоено бюджета', value: formatCurrency(totalSpent),
      sub: `из ${formatCurrency(totalBudget)}`,
      pct: Math.round((totalSpent / totalBudget) * 100),
      icon: DollarSign, color: 'text-[#1B3F8B]', bg: 'bg-blue-50',
    },
    {
      label: 'Активные заявки', value: activeRequests,
      sub: 'на согласовании',
      icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50',
    },
    {
      label: 'Утверждённые', value: approvedRequests,
      sub: 'готовы к лотированию',
      icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50',
    },
    {
      label: 'Активных лотов', value: lots.filter(l => l.status !== 'delivered').length,
      sub: `${lots.filter(l => !l.contractSigned).length} без договора`,
      icon: Package, color: 'text-purple-600', bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
            <p className="text-xs text-gray-400">{c.sub}</p>
            {c.pct !== undefined && (
              <div className="mt-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${c.pct}%`,
                      background: c.pct > 90 ? '#EF4444' : c.pct > 70 ? '#F59E0B' : '#1B3F8B'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{c.pct}% использовано</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Plan-Fact Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-gray-800 font-semibold">План-Факт по закупкам</h2>
              <p className="text-xs text-gray-400 mt-0.5">Сравнение плановых и фактических затрат по месяцам, 2025</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#1B3F8B] inline-block rounded-full" /> План</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#22C55E] inline-block rounded-full" /> Факт</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={planFactData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000000 ? `${v / 1000000}млн` : `${v / 1000}т`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="plan" name="План" stroke="#1B3F8B" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="fact" name="Факт" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4, fill: '#22C55E' }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-gray-800 font-semibold mb-1">Распределение бюджета</h2>
          <p className="text-xs text-gray-400 mb-4">По статьям затрат</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={budgetPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" paddingAngle={2}>
                {budgetPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {budgetPieData.slice(0, 4).map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-600 truncate max-w-[140px]">{d.name}</span>
                </div>
                <span className="text-gray-500 font-medium">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Lots + Budget Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Urgent Lots */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-gray-800 font-semibold">Срочные лоты</h2>
            <span className="ml-auto text-xs text-gray-400">Ближайшие поставки</span>
          </div>
          <div className="space-y-3">
            {urgentLots.map(lot => {
              const isRed = lot.diffDays < 7 && !lot.contractSigned;
              const isYellow = lot.diffDays >= 7 && lot.diffDays <= 30 && !lot.contractSigned;
              const isGreen = lot.contractSigned || lot.diffDays > 30;
              return (
                <div key={lot.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isRed ? 'bg-red-50 border-red-200' : isYellow ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isRed ? 'bg-red-500' : isYellow ? 'bg-amber-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{lot.number}</p>
                    <p className="text-xs text-gray-500 truncate">{lot.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`flex items-center gap-1 text-xs font-semibold ${isRed ? 'text-red-600' : isYellow ? 'text-amber-600' : 'text-green-600'}`}>
                      <Clock className="w-3 h-3" />
                      <CountdownTimer targetDate={lot.deliveryDate} />
                    </div>
                    <p className="text-xs text-gray-400">{new Date(lot.deliveryDate).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget by Articles */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#1B3F8B]" />
            <h2 className="text-gray-800 font-semibold">Исполнение бюджета</h2>
            <span className="ml-auto text-xs text-gray-400">Топ-5 статей</span>
          </div>
          <div className="space-y-3.5">
            {budgetItems.slice(0, 5).map(item => {
              const pct = Math.round((item.spent / item.annualLimit) * 100);
              const isHigh = pct >= 90;
              const isMed = pct >= 70 && pct < 90;
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 font-medium truncate max-w-[200px]">{item.article}</span>
                    <div className="flex items-center gap-2">
                      {isHigh && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      <span className={`text-xs font-semibold ${isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-[#1B3F8B]'}`}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#1B3F8B'
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-gray-400">{formatCurrency(item.spent)}</span>
                    <span className="text-xs text-gray-400">{formatCurrency(item.annualLimit)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}