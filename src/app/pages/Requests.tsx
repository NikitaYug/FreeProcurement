import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Search, Filter, Copy, Eye, Trash2, ChevronDown,
  FileText, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { requests as initialRequests, ProcurementRequest, RequestStatus } from '../data/mockData';

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft:    { label: 'Черновик',        color: 'bg-gray-100 text-gray-600',   icon: <FileText className="w-3 h-3" /> },
  pending:  { label: 'На согласовании', color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'Утверждена',      color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Отклонена',       color: 'bg-red-100 text-red-700',     icon: <XCircle className="w-3 h-3" /> },
};

function formatCurrency(val: number) {
  return val.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
}

export default function Requests() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProcurementRequest[]>(initialRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = items.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
      || r.number.toLowerCase().includes(search.toLowerCase())
      || r.initiator.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: items.length,
    draft: items.filter(r => r.status === 'draft').length,
    pending: items.filter(r => r.status === 'pending').length,
    approved: items.filter(r => r.status === 'approved').length,
    rejected: items.filter(r => r.status === 'rejected').length,
  };

  const handleCopy = (req: ProcurementRequest) => {
    const copy: ProcurementRequest = {
      ...req,
      id: `r${Date.now()}`,
      number: `ЗАК-2025-${String(items.length + 1).padStart(3, '0')}`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setItems(prev => [copy, ...prev]);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(r => r.id !== id));
    setSelected(prev => prev.filter(s => s !== id));
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(r => r.id));
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-semibold">Список заявок</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление закупочными заявками</p>
        </div>
        <button
          onClick={() => navigate('/requests/new')}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#1B3F8B] rounded-lg hover:bg-[#152f6b] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Создать заявку
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          ['all', 'Все'],
          ['draft', 'Черновики'],
          ['pending', 'На согласовании'],
          ['approved', 'Утверждённые'],
          ['rejected', 'Отклонённые'],
        ] as [RequestStatus | 'all', string][]).map(([s, label]) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm transition-all border ${
              statusFilter === s
                ? 'bg-[#1B3F8B] text-white border-[#1B3F8B]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B3F8B]/40 hover:text-[#1B3F8B]'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
              statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-sm bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по номеру, названию, инициатору..."
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-[#1B3F8B]">
            <AlertCircle className="w-4 h-4" />
            Выбрано: {selected.length}
            <button className="ml-2 text-xs underline hover:no-underline">Действия</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3.5 w-10">
                  <input type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 accent-[#1B3F8B]"
                  />
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Номер</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Наименование</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Статья бюджета</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Сумма</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Дата поставки</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Инициатор</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
                <th className="px-4 py-3.5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(req => {
                const st = statusConfig[req.status];
                return (
                  <tr key={req.id} className={`hover:bg-gray-50 transition-colors group ${selected.includes(req.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.includes(req.id)}
                        onChange={() => toggleSelect(req.id)}
                        className="rounded border-gray-300 accent-[#1B3F8B]"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[#1B3F8B] font-medium hover:underline cursor-pointer" onClick={() => navigate(`/requests/${req.id}`)}>
                        {req.number}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[280px]">
                      <div className="truncate font-medium text-gray-800">{req.name}</div>
                      <div className="text-xs text-gray-400">{req.nomenclatureGroup} · {req.quantity} {req.unit}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{req.budgetArticle}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-800">{formatCurrency(req.totalCost)}</td>
                    <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell">
                      {new Date(req.desiredDeliveryDate).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs hidden xl:table-cell">{req.initiator}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                        {st.icon}{st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/requests/${req.id}`)}
                          className="p-1.5 text-gray-400 hover:text-[#1B3F8B] hover:bg-blue-50 rounded-lg transition-all"
                          title="Просмотр"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(req)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Копировать"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* visible on mobile */}
                      <div className="flex items-center gap-1 justify-end md:hidden">
                        <button onClick={() => handleCopy(req)} className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Заявки не найдены</p>
                    <p className="text-xs mt-1">Попробуйте изменить фильтры поиска</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Показано {filtered.length} из {items.length} заявок</span>
          <span>
            Итого: <strong className="text-gray-700">{formatCurrency(filtered.reduce((s, r) => s + r.totalCost, 0))}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}