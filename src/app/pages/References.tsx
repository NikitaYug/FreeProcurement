import { useState } from 'react';
import {
  BookOpen, Search, Plus, Edit2, Trash2, Building2,
  Package, Users, Tag, ChevronRight, Star
} from 'lucide-react';
import { nomenclatureItems, nomenclatureGroups, suppliers, units } from '../data/mockData';

type Tab = 'nomenclature' | 'suppliers' | 'units' | 'groups';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'nomenclature', label: 'Номенклатура', icon: <Package className="w-4 h-4" /> },
  { id: 'suppliers', label: 'Поставщики', icon: <Building2 className="w-4 h-4" /> },
  { id: 'units', label: 'Единицы измерения', icon: <Tag className="w-4 h-4" /> },
  { id: 'groups', label: 'Группы номенклатуры', icon: <BookOpen className="w-4 h-4" /> },
];

export default function References() {
  const [activeTab, setActiveTab] = useState<Tab>('nomenclature');
  const [search, setSearch] = useState('');

  const filteredNomenclature = nomenclatureItems.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.code.includes(search) ||
    n.group.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.inn.includes(search)
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-gray-900 font-semibold">Справочники</h1>
        <p className="text-sm text-gray-500 mt-0.5">Управление нормативно-справочной информацией</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-all -mb-px ${
              activeTab === t.id
                ? 'border-[#1B3F8B] text-[#1B3F8B] font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..." className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#1B3F8B] rounded-lg hover:bg-[#152f6b] transition-all">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {/* Content */}
      {activeTab === 'nomenclature' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Код</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Наименование</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Группа</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Ед.изм.</th>
                <th className="px-5 py-3.5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredNomenclature.map(n => (
                <tr key={n.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{n.code}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{n.name}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{n.group}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{n.unit}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-[#1B3F8B] hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSuppliers.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#1B3F8B]" />
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{s.deliveryRating}</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{s.name}</h3>
              <p className="text-xs text-gray-400 mb-3">ИНН: {s.inn}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-green-600 font-semibold">{s.avgDiscount}%</p>
                  <p className="text-gray-400">Средняя скидка</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-[#1B3F8B] font-semibold">{s.totalDeals}</p>
                  <p className="text-gray-400">Сделок</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Последняя сделка: {new Date(s.lastDealDate).toLocaleDateString('ru-RU')}</p>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1">
                  <Edit2 className="w-3 h-3" /> Изменить
                </button>
                <button className="flex-1 text-xs px-3 py-1.5 border border-[#1B3F8B]/40 rounded-lg text-[#1B3F8B] hover:bg-blue-50 flex items-center justify-center gap-1">
                  <ChevronRight className="w-3 h-3" /> История
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'units' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 divide-x divide-y divide-gray-100">
            {units.map(u => (
              <div key={u} className="px-5 py-4 hover:bg-gray-50 group transition-all flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{u}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {u === 'шт' ? 'Штука' : u === 'лиц' ? 'Лицензия' : u === 'компл' ? 'Комплект' : u === 'пач' ? 'Пачка' : u === 'упак' ? 'Упаковка' : u === 'пог.м' ? 'Погонный метр' : u}
                  </p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {nomenclatureGroups.map(g => (
            <div key={g} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-[#1B3F8B]/30 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#1B3F8B]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{g}</p>
                  <p className="text-xs text-gray-400">
                    {nomenclatureItems.filter(n => n.group === g).length} позиций
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-[#1B3F8B] hover:bg-blue-50 rounded-lg">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}