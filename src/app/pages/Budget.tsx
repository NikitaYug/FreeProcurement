import { useState } from 'react';
import { TrendingUp, AlertTriangle, Plus, Download, Filter, Search } from 'lucide-react';
import { budgetItems, BudgetItem } from '../data/mockData';

function formatCurrency(val: number) {
  return val.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
}

function StatusBadge({ pct }: { pct: number }) {
  if (pct >= 90) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium"><AlertTriangle className="w-3 h-3" />Критично</span>;
  if (pct >= 70) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Высокий расход</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">В норме</span>;
}

interface EditRow extends BudgetItem {
  editing?: boolean;
}

export default function Budget() {
  const [items, setItems] = useState<EditRow[]>(budgetItems);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ article: '', department: '', annualLimit: '' });

  const depts = Array.from(new Set(items.map(i => i.department)));
  const filtered = items.filter(i => {
    const matchSearch = i.article.toLowerCase().includes(search.toLowerCase()) || i.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || i.department === filterDept;
    return matchSearch && matchDept;
  });

  const totalLimit = filtered.reduce((s, i) => s + i.annualLimit, 0);
  const totalSpent = filtered.reduce((s, i) => s + i.spent, 0);
  const totalAvailable = totalLimit - totalSpent;

  const handleAdd = () => {
    if (!newItem.article || !newItem.department || !newItem.annualLimit) return;
    setItems(prev => [...prev, {
      id: `b${Date.now()}`,
      article: newItem.article,
      department: newItem.department,
      annualLimit: Number(newItem.annualLimit),
      spent: 0,
    }]);
    setNewItem({ article: '', department: '', annualLimit: '' });
    setShowAddModal(false);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-semibold">План закупок — Бюджетные лимиты</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление статьями бюджета и контроль исполнения, 2025</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" /> Экспорт
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#1B3F8B] rounded-lg hover:bg-[#152f6b] transition-all"
          >
            <Plus className="w-4 h-4" /> Добавить статью
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Годовой лимит (итого)', value: formatCurrency(totalLimit), color: 'text-[#1B3F8B]', bg: 'bg-blue-50' },
          { label: 'Потрачено', value: formatCurrency(totalSpent), color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Доступный остаток', value: formatCurrency(totalAvailable), color: 'text-green-700', bg: 'bg-green-50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4 border border-transparent`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
            <p className={`text-xl font-bold ${c.color} mt-1`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по статье или подразделению..."
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer">
            <option value="all">Все подразделения</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статья бюджета</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Подразделение</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Годовой лимит</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Потрачено</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Остаток</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[180px]">Исполнение</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => {
                const pct = Math.round((item.spent / item.annualLimit) * 100);
                const available = item.annualLimit - item.spent;
                const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#1B3F8B';
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-8 rounded-full" style={{ background: barColor }} />
                        <span className="font-medium text-gray-800">{item.article}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{item.department}</td>
                    <td className="px-5 py-4 text-right font-medium text-gray-800">{formatCurrency(item.annualLimit)}</td>
                    <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(item.spent)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-semibold ${available < 0 ? 'text-red-600' : 'text-green-700'}`}>
                        {formatCurrency(available)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{pct}%</span>
                          <span>{item.annualLimit > 0 ? `${(100 - pct)}% свободно` : ''}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge pct={pct} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="px-5 py-3.5 font-semibold text-gray-800" colSpan={2}>Итого:</td>
                <td className="px-5 py-3.5 text-right font-bold text-gray-900">{formatCurrency(totalLimit)}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-gray-700">{formatCurrency(totalSpent)}</td>
                <td className="px-5 py-3.5 text-right font-bold text-green-700">{formatCurrency(totalAvailable)}</td>
                <td className="px-5 py-3.5" />
                <td className="px-5 py-3.5" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Добавить статью бюджета</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Статья бюджета</label>
                <input
                  type="text" value={newItem.article}
                  onChange={e => setNewItem(p => ({ ...p, article: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B]"
                  placeholder="Название статьи бюджета"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
                <input
                  type="text" value={newItem.department}
                  onChange={e => setNewItem(p => ({ ...p, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B]"
                  placeholder="Название подразделения"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Годовой лимит, ₽</label>
                <input
                  type="number" value={newItem.annualLimit}
                  onChange={e => setNewItem(p => ({ ...p, annualLimit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B]"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleAdd}
                className="flex-1 px-4 py-2 text-sm bg-[#1B3F8B] text-white rounded-lg hover:bg-[#152f6b]">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
