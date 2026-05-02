import { useState, useMemo } from 'react';
import {
  Package, Plus, CheckSquare, Square, FileText, Star,
  ChevronRight, DollarSign, Calendar, Users, Download,
  AlertCircle, Check, Truck, Clock, Search
} from 'lucide-react';
import { requests, lots as initialLots, suppliers, Lot, LotStatus } from '../data/mockData';

function formatCurrency(val: number) {
  return val.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
}

const lotStatusConfig: Record<LotStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft:     { label: 'Черновик',     color: 'bg-gray-100 text-gray-600',    icon: <FileText className="w-3 h-3" /> },
  published: { label: 'Опубликован',  color: 'bg-blue-100 text-blue-700',    icon: <Clock className="w-3 h-3" /> },
  formed:    { label: 'Сформирован',  color: 'bg-purple-100 text-purple-700',icon: <Package className="w-3 h-3" /> },
  delivered: { label: 'Поставлен',    color: 'bg-green-100 text-green-700',  icon: <Check className="w-3 h-3" /> },
  error:     { label: 'Ошибка',       color: 'bg-red-100 text-red-700',      icon: <AlertCircle className="w-3 h-3" /> },
};

export default function Lots() {
  const [lots, setLots] = useState(initialLots);
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [lotName, setLotName] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showConstructor, setShowConstructor] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'constructor'>('list');
  const [search, setSearch] = useState('');

  const toggleReq = (id: string) => {
    setSelectedReqs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedRequests = approvedRequests.filter(r => selectedReqs.includes(r.id));
  const totalSelected = selectedRequests.reduce((s, r) => s + r.totalCost, 0);
  const earliestDate = selectedRequests.length > 0
    ? selectedRequests.reduce((min, r) => r.desiredDeliveryDate < min ? r.desiredDeliveryDate : min, selectedRequests[0].desiredDeliveryDate)
    : null;

  const sortedSuppliers = useMemo(() =>
    [...suppliers].sort((a, b) => b.avgDiscount - a.avgDiscount), []);

  const handleCreateLot = () => {
    if (selectedReqs.length === 0 || !lotName.trim()) return;
    const newLot: Lot = {
      id: `l${Date.now()}`,
      number: `ЛОТ-2025-${String(lots.length + 1).padStart(3, '0')}`,
      name: lotName,
      requestIds: selectedReqs,
      totalCost: totalSelected,
      deliveryDate: earliestDate || '',
      status: 'draft',
      supplierId: selectedSupplier || undefined,
      contractSigned: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLots(prev => [newLot, ...prev]);
    setSelectedReqs([]);
    setLotName('');
    setSelectedSupplier('');
    setActiveTab('list');
  };

  const filteredLots = lots.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) || l.number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900 font-semibold">Управление лотами</h1>
          <p className="text-sm text-gray-500 mt-0.5">Формирование лотов из утверждённых заявок</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm rounded-lg border transition-all ${activeTab === 'list' ? 'bg-[#1B3F8B] text-white border-[#1B3F8B]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B3F8B]/40'}`}
          >
            Список лотов
          </button>
          <button
            onClick={() => setActiveTab('constructor')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all ${activeTab === 'constructor' ? 'bg-[#1B3F8B] text-white border-[#1B3F8B]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B3F8B]/40'}`}
          >
            <Plus className="w-4 h-4" /> Конструктор лотов
          </button>
        </div>
      </div>

      {/* === LOT LIST === */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по лотам..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredLots.map(lot => {
              const st = lotStatusConfig[lot.status];
              const supplier = suppliers.find(s => s.id === lot.supplierId);
              const diffDays = Math.ceil((new Date(lot.deliveryDate).getTime() - Date.now()) / 86400000);
              const isUrgent = diffDays < 7 && !lot.contractSigned && lot.status !== 'delivered';

              return (
                <div key={lot.id} className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all ${isUrgent ? 'border-red-300' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#1B3F8B] font-semibold text-sm">{lot.number}</span>
                        {isUrgent && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Срочно!
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium mt-1">{lot.name}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${st.color}`}>
                      {st.icon}{st.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Сумма лота</p>
                        <p className="font-semibold text-gray-800">{formatCurrency(lot.totalCost)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Дата поставки</p>
                        <p className={`font-semibold ${diffDays < 7 ? 'text-red-600' : diffDays < 30 ? 'text-amber-600' : 'text-gray-800'}`}>
                          {new Date(lot.deliveryDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Заявок</p>
                        <p className="font-semibold text-gray-800">{lot.requestIds.length} позиции</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Договор</p>
                        <p className={`font-semibold ${lot.contractSigned ? 'text-green-600' : 'text-amber-600'}`}>
                          {lot.contractSigned ? 'Подписан' : 'Не подписан'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {supplier && (
                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 font-medium">{supplier.name}</p>
                        <p className="text-xs text-blue-400">ИНН: {supplier.inn} · Скидка: {supplier.avgDiscount}%</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-semibold">{supplier.deliveryRating}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> Договор
                    </button>
                    <button className="flex-1 text-xs px-3 py-1.5 border border-[#1B3F8B]/40 rounded-lg text-[#1B3F8B] hover:bg-blue-50 flex items-center justify-center gap-1">
                      <ChevronRight className="w-3 h-3" /> Подробнее
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === LOT CONSTRUCTOR === */}
      {activeTab === 'constructor' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Approved Requests */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Утверждённые заявки</h3>
              <p className="text-xs text-gray-400 mt-0.5">Выберите заявки для включения в лот</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {approvedRequests.map(req => {
                const isSelected = selectedReqs.includes(req.id);
                return (
                  <button
                    key={req.id}
                    onClick={() => toggleReq(req.id)}
                    className={`w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-all ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#1B3F8B] border-[#1B3F8B]' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#1B3F8B] font-medium">{req.number}</span>
                        <span className="text-sm font-semibold text-gray-800 flex-shrink-0">{formatCurrency(req.totalCost)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5 truncate">{req.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{req.quantity} {req.unit}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(req.desiredDeliveryDate).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Lot Constructor */}
          <div className="space-y-4">
            {/* Lot Summary */}
            <div className={`rounded-xl border p-5 transition-all ${selectedReqs.length > 0 ? 'bg-white border-[#1B3F8B]/30' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1B3F8B]" />
                Формирование лота
              </h3>

              {selectedReqs.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Выберите заявки из списка слева</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">Итоговая сумма</p>
                      <p className="font-bold text-[#1B3F8B]">{formatCurrency(totalSelected)}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">Ранняя дата поставки</p>
                      <p className="font-bold text-green-700">
                        {earliestDate ? new Date(earliestDate).toLocaleDateString('ru-RU') : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {selectedRequests.map(r => (
                      <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-700 truncate flex-1 mr-2">{r.name}</span>
                        <span className="font-medium text-gray-800 flex-shrink-0">{formatCurrency(r.totalCost)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Название лота</label>
                    <input
                      type="text" value={lotName} onChange={e => setLotName(e.target.value)}
                      placeholder="Введите название лота..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Recommended Suppliers */}
            {selectedReqs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Рекомендуемые поставщики
                </h3>
                <p className="text-xs text-gray-400 mb-3">На основе истории закупок за 24 месяца · Сортировка: лучшая цена</p>
                <div className="space-y-2.5">
                  {sortedSuppliers.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSupplier(s.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedSupplier === s.id ? 'border-[#1B3F8B] bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">Топ</span>}
                          <span className="text-sm font-medium text-gray-800">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-semibold text-gray-700">{s.deliveryRating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="text-green-600 font-medium">Скидка: {s.avgDiscount}%</span>
                        <span>·</span>
                        <span>Сделок: {s.totalDeals}</span>
                        <span>·</span>
                        <span>Последняя: {new Date(s.lastDealDate).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedReqs.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleCreateLot}
                  disabled={!lotName.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${lotName.trim() ? 'bg-[#1B3F8B] text-white hover:bg-[#152f6b]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <Package className="w-4 h-4" /> Создать лот
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all">
                  <Download className="w-4 h-4" /> Договор
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
