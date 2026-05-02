import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Save, Send, AlertCircle, CheckCircle,
  Calendar, ChevronDown, Search, Info, DollarSign
} from 'lucide-react';
import {
  requests, budgetItems, nomenclatureItems, nomenclatureGroups, units,
  ProcurementRequest
} from '../data/mockData';

function formatCurrency(val: number) {
  return val.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
}

export default function RequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const sourceRequest = id && !isNew ? requests.find(r => r.id === id) : null;

  const [form, setForm] = useState({
    nomenclatureGroup: sourceRequest?.nomenclatureGroup || '',
    name: sourceRequest?.name || '',
    quantity: sourceRequest?.quantity?.toString() || '',
    unit: sourceRequest?.unit || 'шт',
    pricePerUnit: sourceRequest?.pricePerUnit?.toString() || '',
    budgetItemId: sourceRequest?.budgetItemId || '',
    desiredDeliveryDate: sourceRequest?.desiredDeliveryDate || '',
    comment: sourceRequest?.comment || '',
  });

  const [autocomplete, setAutocomplete] = useState<typeof nomenclatureItems>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Autocomplete for name
  useEffect(() => {
    if (form.name.length >= 2) {
      const filtered = nomenclatureItems.filter(n =>
        n.name.toLowerCase().includes(form.name.toLowerCase())
        || n.code.includes(form.name)
      );
      setAutocomplete(filtered);
    } else {
      setAutocomplete([]);
    }
  }, [form.name]);

  const totalCost = useMemo(() => {
    const qty = parseFloat(form.quantity) || 0;
    const price = parseFloat(form.pricePerUnit) || 0;
    return qty * price;
  }, [form.quantity, form.pricePerUnit]);

  const selectedBudgetItem = budgetItems.find(b => b.id === form.budgetItemId);
  const budgetAvailable = selectedBudgetItem ? selectedBudgetItem.annualLimit - selectedBudgetItem.spent : null;
  const budgetExceeded = budgetAvailable !== null && totalCost > budgetAvailable;

  const today = new Date().toISOString().split('T')[0];

  const errors: Record<string, string> = {};
  if (!form.nomenclatureGroup) errors.nomenclatureGroup = 'Выберите номенклатурную группу';
  if (!form.name) errors.name = 'Укажите наименование';
  else if (form.name.length > 200) errors.name = 'Не более 200 символов';
  if (!form.quantity || parseFloat(form.quantity) <= 0) errors.quantity = 'Укажите количество';
  if (!form.pricePerUnit || parseFloat(form.pricePerUnit) <= 0) errors.pricePerUnit = 'Укажите цену';
  if (!form.budgetItemId) errors.budgetItemId = 'Выберите статью бюджета';
  if (!form.desiredDeliveryDate) errors.desiredDeliveryDate = 'Укажите дату поставки';
  else if (form.desiredDeliveryDate < today) errors.desiredDeliveryDate = 'Дата не может быть в прошлом';

  const isValid = Object.keys(errors).length === 0 && !budgetExceeded;

  const field = (key: string) => ({
    onBlur: () => setTouched(p => ({ ...p, [key]: true })),
    error: (touched[key] || submitted) && errors[key],
  });

  const handleSubmit = (asDraft = false) => {
    setSubmitted(true);
    if (!asDraft && !isValid) return;
    alert(`Заявка ${asDraft ? 'сохранена как черновик' : 'отправлена на согласование'}!`);
    navigate('/requests');
  };

  const set = (key: string) => (val: string) => setForm(p => ({ ...p, [key]: val }));
  const handle = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(key)(e.target.value);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/requests')}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-gray-900 font-semibold">
            {isNew ? 'Новая заявка' : sourceRequest ? `Редактирование: ${sourceRequest.number}` : 'Просмотр заявки'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isNew ? 'Заполните форму для создания закупочной заявки' : 'Копия заявки с предзаполненными данными'}
          </p>
        </div>
        {!isNew && sourceRequest && (
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Копия от {sourceRequest.number}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Nomenclature */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-medium text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1B3F8B] text-white text-xs flex items-center justify-center">1</span>
              Номенклатура
            </h3>

            {/* Nomenclature Group */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Номенклатурная группа <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.nomenclatureGroup}
                  onChange={e => { handle('nomenclatureGroup')(e); setTouched(p => ({ ...p, nomenclatureGroup: true })); }}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B] ${(touched.nomenclatureGroup || submitted) && errors.nomenclatureGroup ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                >
                  <option value="">— Выберите группу —</option>
                  {nomenclatureGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {(touched.nomenclatureGroup || submitted) && errors.nomenclatureGroup && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nomenclatureGroup}</p>
              )}
            </div>

            {/* Name with Autocomplete */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Наименование <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-400 ml-2">{form.name.length}/200</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={e => { set('name')(e.target.value); setShowAutocomplete(true); setTouched(p => ({ ...p, name: true })); }}
                  onFocus={() => setShowAutocomplete(true)}
                  onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                  maxLength={200}
                  placeholder="Начните вводить наименование товара или услуги..."
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B] ${(touched.name || submitted) && errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
              </div>
              {/* Autocomplete Dropdown */}
              {showAutocomplete && autocomplete.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                  {autocomplete.map(n => (
                    <button
                      key={n.id}
                      onMouseDown={() => {
                        set('name')(n.name);
                        set('unit')(n.unit);
                        if (!form.nomenclatureGroup) set('nomenclatureGroup')(n.group);
                        setShowAutocomplete(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-start gap-3 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{n.name}</p>
                        <p className="text-xs text-gray-400">{n.code} · {n.group} · {n.unit}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {(touched.name || submitted) && errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>
              )}
            </div>

            {/* Quantity + Unit + Price */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Количество <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" value={form.quantity} min="0"
                  onChange={handle('quantity')} {...field('quantity')}
                  placeholder="0"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B] ${(touched.quantity || submitted) && errors.quantity ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {(touched.quantity || submitted) && errors.quantity && (
                  <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ед. изм.</label>
                <div className="relative">
                  <select value={form.unit} onChange={handle('unit')}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B]">
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Цена за ед. (₽) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" value={form.pricePerUnit} min="0"
                  onChange={handle('pricePerUnit')} {...field('pricePerUnit')}
                  placeholder="0.00"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B] ${(touched.pricePerUnit || submitted) && errors.pricePerUnit ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
              </div>
            </div>

            {/* Total Cost (ReadOnly) */}
            <div className="mt-4 p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Общая стоимость (авторасчёт)
              </span>
              <span className={`text-lg font-bold ${budgetExceeded ? 'text-red-600' : 'text-[#1B3F8B]'}`}>
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          {/* Section 2: Delivery */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-medium text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1B3F8B] text-white text-xs flex items-center justify-center">2</span>
              Срок поставки
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Желаемая дата поставки <span className="text-red-500">*</span>
              </label>
              <div className="relative max-w-xs">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={form.desiredDeliveryDate}
                  min={today}
                  onChange={handle('desiredDeliveryDate')}
                  {...field('desiredDeliveryDate')}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B] ${(touched.desiredDeliveryDate || submitted) && errors.desiredDeliveryDate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
              </div>
              {(touched.desiredDeliveryDate || submitted) && errors.desiredDeliveryDate && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.desiredDeliveryDate}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" /> Выбор дат ранее сегодняшней недоступен
              </p>
            </div>

            {/* Comment */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Комментарий</label>
              <textarea
                value={form.comment}
                onChange={handle('comment')}
                rows={3}
                placeholder="Дополнительные требования, технические характеристики..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Budget Control */}
          <div className={`rounded-xl border p-5 ${budgetExceeded ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
            <h3 className={`font-medium mb-4 flex items-center gap-2 ${budgetExceeded ? 'text-red-700' : 'text-gray-800'}`}>
              {budgetExceeded ? <AlertCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
              Контроль бюджета
            </h3>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Статья бюджета <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.budgetItemId}
                  onChange={e => { handle('budgetItemId')(e); setTouched(p => ({ ...p, budgetItemId: true })); }}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm appearance-none bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-[#1B3F8B]/30 focus:border-[#1B3F8B] ${(touched.budgetItemId || submitted) && errors.budgetItemId ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                >
                  <option value="">— Выберите статью —</option>
                  {budgetItems.map(b => (
                    <option key={b.id} value={b.id}>{b.article}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {selectedBudgetItem && (
              <div className="space-y-2.5 p-3 bg-white/70 rounded-lg border border-gray-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Годовой лимит:</span>
                  <span className="font-semibold text-gray-700">{formatCurrency(selectedBudgetItem.annualLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Уже потрачено:</span>
                  <span className="font-semibold text-gray-700">{formatCurrency(selectedBudgetItem.spent)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-gray-500">Текущий остаток:</span>
                  <span className={`font-bold ${budgetAvailable! < totalCost ? 'text-red-600' : 'text-green-700'}`}>
                    {formatCurrency(budgetAvailable!)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-gray-500">Эта заявка:</span>
                  <span className={`font-bold ${budgetExceeded ? 'text-red-600' : 'text-[#1B3F8B]'}`}>
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(((selectedBudgetItem.spent + totalCost) / selectedBudgetItem.annualLimit) * 100, 100)}%`,
                      background: budgetExceeded ? '#EF4444' : '#1B3F8B',
                    }} />
                  </div>
                  <p className={`text-xs mt-1 ${budgetExceeded ? 'text-red-600' : 'text-gray-400'}`}>
                    {Math.round(((selectedBudgetItem.spent + totalCost) / selectedBudgetItem.annualLimit) * 100)}% от лимита (с учётом заявки)
                  </p>
                </div>
              </div>
            )}

            {budgetExceeded && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-xs text-red-700 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Превышен бюджетный лимит!
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Сумма заявки превышает доступный остаток на {formatCurrency(totalCost - (budgetAvailable || 0))}.
                  Требуется пересогласование бюджета.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={!isValid}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isValid
                  ? 'bg-[#1B3F8B] text-white hover:bg-[#152f6b] shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              Отправить на согласование
            </button>
            <button
              onClick={() => handleSubmit(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
            >
              <Save className="w-4 h-4" />
              Сохранить как черновик
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              После отправки заявка поступит на согласование руководителю подразделения. Статус можно отслеживать в списке заявок.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
