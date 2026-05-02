export type RequestStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type LotStatus = 'draft' | 'published' | 'formed' | 'delivered' | 'error';
export type UserRole = 'initiator' | 'manager' | 'director';

export interface BudgetItem {
  id: string;
  article: string;
  department: string;
  annualLimit: number;
  spent: number;
}

export interface ProcurementRequest {
  id: string;
  number: string;
  nomenclatureGroup: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalCost: number;
  budgetArticle: string;
  budgetItemId: string;
  desiredDeliveryDate: string;
  status: RequestStatus;
  initiator: string;
  createdAt: string;
  comment?: string;
}

export interface Supplier {
  id: string;
  name: string;
  inn: string;
  avgDiscount: number;
  deliveryRating: number;
  lastDealDate: string;
  totalDeals: number;
}

export interface Lot {
  id: string;
  number: string;
  name: string;
  requestIds: string[];
  totalCost: number;
  deliveryDate: string;
  status: LotStatus;
  supplierId?: string;
  contractSigned: boolean;
  createdAt: string;
}

export interface NomenclatureItem {
  id: string;
  code: string;
  name: string;
  group: string;
  unit: string;
}

// ============ BUDGET DATA ============
export const budgetItems: BudgetItem[] = [
  { id: 'b1', article: 'ИТ-оборудование', department: 'Департамент ИТ', annualLimit: 5000000, spent: 3120000 },
  { id: 'b2', article: 'Программное обеспечение', department: 'Департамент ИТ', annualLimit: 2000000, spent: 1850000 },
  { id: 'b3', article: 'Оргтехника и расходники', department: 'АХО', annualLimit: 800000, spent: 210000 },
  { id: 'b4', article: 'Мебель и инвентарь', department: 'АХО', annualLimit: 1200000, spent: 480000 },
  { id: 'b5', article: 'Средства связи', department: 'Департамент ИТ', annualLimit: 600000, spent: 590000 },
  { id: 'b6', article: 'Канцелярские товары', department: 'АХО', annualLimit: 300000, spent: 98000 },
  { id: 'b7', article: 'Транспортные услуги', department: 'Логистика', annualLimit: 1500000, spent: 1100000 },
  { id: 'b8', article: 'Обучение персонала', department: 'HR', annualLimit: 900000, spent: 320000 },
  { id: 'b9', article: 'Охрана и безопасность', department: 'Служба безопасности', annualLimit: 2400000, spent: 2380000 },
  { id: 'b10', article: 'Коммунальные услуги', department: 'АХО', annualLimit: 3600000, spent: 1800000 },
];

// ============ SUPPLIERS DATA ============
export const suppliers: Supplier[] = [
  { id: 's1', name: 'ООО «ТехноПарк»', inn: '7712345678', avgDiscount: 12, deliveryRating: 4.8, lastDealDate: '2024-11-15', totalDeals: 24 },
  { id: 's2', name: 'АО «ИТ-Ресурс»', inn: '7709876543', avgDiscount: 8, deliveryRating: 4.5, lastDealDate: '2024-10-22', totalDeals: 18 },
  { id: 's3', name: 'ООО «Комплект Про»', inn: '7701234567', avgDiscount: 15, deliveryRating: 4.2, lastDealDate: '2025-01-08', totalDeals: 31 },
  { id: 's4', name: 'ИП Соколов А.В.', inn: '770123456789', avgDiscount: 5, deliveryRating: 3.9, lastDealDate: '2024-09-14', totalDeals: 7 },
  { id: 's5', name: 'ООО «МегаОфис»', inn: '7725678901', avgDiscount: 10, deliveryRating: 4.6, lastDealDate: '2025-02-01', totalDeals: 42 },
];

// ============ REQUESTS DATA ============
export const requests: ProcurementRequest[] = [
  {
    id: 'r1', number: 'ЗАК-2025-001', nomenclatureGroup: 'Компьютеры и ноутбуки',
    name: 'Ноутбук Dell Latitude 5540 (15.6", Intel Core i7, 16GB RAM, 512GB SSD)',
    quantity: 15, unit: 'шт', pricePerUnit: 95000, totalCost: 1425000,
    budgetArticle: 'ИТ-оборудование', budgetItemId: 'b1',
    desiredDeliveryDate: '2025-05-20', status: 'approved',
    initiator: 'Иванова М.С.', createdAt: '2025-04-10',
  },
  {
    id: 'r2', number: 'ЗАК-2025-002', nomenclatureGroup: 'Периферийные устройства',
    name: 'Мышь беспроводная Logitech MX Master 3S',
    quantity: 50, unit: 'шт', pricePerUnit: 7500, totalCost: 375000,
    budgetArticle: 'ИТ-оборудование', budgetItemId: 'b1',
    desiredDeliveryDate: '2025-05-15', status: 'approved',
    initiator: 'Иванова М.С.', createdAt: '2025-04-11',
  },
  {
    id: 'r3', number: 'ЗАК-2025-003', nomenclatureGroup: 'Программное обеспечение',
    name: 'Лицензия Microsoft 365 Business Premium (1 год)',
    quantity: 100, unit: 'лиц', pricePerUnit: 8500, totalCost: 850000,
    budgetArticle: 'Программное обеспечение', budgetItemId: 'b2',
    desiredDeliveryDate: '2025-05-30', status: 'pending',
    initiator: 'Петров А.К.', createdAt: '2025-04-15',
  },
  {
    id: 'r4', number: 'ЗАК-2025-004', nomenclatureGroup: 'Оргтехника',
    name: 'МФУ HP LaserJet MFP M236sdw',
    quantity: 5, unit: 'шт', pricePerUnit: 28000, totalCost: 140000,
    budgetArticle: 'Оргтехника и расходники', budgetItemId: 'b3',
    desiredDeliveryDate: '2025-06-05', status: 'approved',
    initiator: 'Сидорова Е.В.', createdAt: '2025-04-16',
  },
  {
    id: 'r5', number: 'ЗАК-2025-005', nomenclatureGroup: 'Мебель',
    name: 'Кресло офисное эргономичное Herman Miller Aeron',
    quantity: 20, unit: 'шт', pricePerUnit: 45000, totalCost: 900000,
    budgetArticle: 'Мебель и инвентарь', budgetItemId: 'b4',
    desiredDeliveryDate: '2025-06-20', status: 'draft',
    initiator: 'Новиков Р.И.', createdAt: '2025-04-18',
  },
  {
    id: 'r6', number: 'ЗАК-2025-006', nomenclatureGroup: 'Средства связи',
    name: 'IP-телефон Cisco IP Phone 8841',
    quantity: 30, unit: 'шт', pricePerUnit: 18000, totalCost: 540000,
    budgetArticle: 'Средства связи', budgetItemId: 'b5',
    desiredDeliveryDate: '2025-05-25', status: 'rejected',
    initiator: 'Козлов Д.М.', createdAt: '2025-04-12',
    comment: 'Превышен бюджетный лимит по статье. Необходимо пересогласование.',
  },
  {
    id: 'r7', number: 'ЗАК-2025-007', nomenclatureGroup: 'Компьютеры и ноутбуки',
    name: 'Монитор Samsung 27" 4K UHD IPS (S27B800PXI)',
    quantity: 25, unit: 'шт', pricePerUnit: 42000, totalCost: 1050000,
    budgetArticle: 'ИТ-оборудование', budgetItemId: 'b1',
    desiredDeliveryDate: '2025-07-01', status: 'approved',
    initiator: 'Иванова М.С.', createdAt: '2025-04-20',
  },
  {
    id: 'r8', number: 'ЗАК-2025-008', nomenclatureGroup: 'Канцелярские товары',
    name: 'Бумага для принтера А4 (500 листов, 80 г/м², класс А)',
    quantity: 200, unit: 'пач', pricePerUnit: 450, totalCost: 90000,
    budgetArticle: 'Канцелярские товары', budgetItemId: 'b6',
    desiredDeliveryDate: '2025-05-10', status: 'approved',
    initiator: 'Сидорова Е.В.', createdAt: '2025-04-21',
  },
  {
    id: 'r9', number: 'ЗАК-2025-009', nomenclatureGroup: 'Программное обеспечение',
    name: '1С:Предприятие 8.3 — Бухгалтерия предприятия (лицензия на 5 РМ)',
    quantity: 2, unit: 'компл', pricePerUnit: 85000, totalCost: 170000,
    budgetArticle: 'Программное обеспечение', budgetItemId: 'b2',
    desiredDeliveryDate: '2025-06-15', status: 'pending',
    initiator: 'Волкова Т.Н.', createdAt: '2025-04-22',
  },
  {
    id: 'r10', number: 'ЗАК-2025-010', nomenclatureGroup: 'Сетевое оборудование',
    name: 'Коммутатор Cisco Catalyst 2960-X (24 порта GE)',
    quantity: 8, unit: 'шт', pricePerUnit: 65000, totalCost: 520000,
    budgetArticle: 'ИТ-оборудование', budgetItemId: 'b1',
    desiredDeliveryDate: '2025-06-10', status: 'approved',
    initiator: 'Петров А.К.', createdAt: '2025-04-23',
  },
];

// ============ LOTS DATA ============
export const lots: Lot[] = [
  {
    id: 'l1', number: 'ЛОТ-2025-001',
    name: 'Закупка ноутбуков и периферии для Департамента ИТ',
    requestIds: ['r1', 'r2'],
    totalCost: 1800000,
    deliveryDate: '2025-05-15',
    status: 'published',
    supplierId: 's1',
    contractSigned: false,
    createdAt: '2025-04-25',
  },
  {
    id: 'l2', number: 'ЛОТ-2025-002',
    name: 'Закупка мониторов и сетевого оборудования',
    requestIds: ['r7', 'r10'],
    totalCost: 1570000,
    deliveryDate: '2025-06-10',
    status: 'formed',
    supplierId: 's2',
    contractSigned: true,
    createdAt: '2025-04-26',
  },
  {
    id: 'l3', number: 'ЛОТ-2025-003',
    name: 'Канцелярские товары и расходные материалы',
    requestIds: ['r8'],
    totalCost: 90000,
    deliveryDate: '2025-05-08',
    status: 'delivered',
    supplierId: 's5',
    contractSigned: true,
    createdAt: '2025-04-22',
  },
  {
    id: 'l4', number: 'ЛОТ-2025-004',
    name: 'Закупка оргтехники (МФУ)',
    requestIds: ['r4'],
    totalCost: 140000,
    deliveryDate: '2025-05-28',
    status: 'published',
    supplierId: 's3',
    contractSigned: false,
    createdAt: '2025-04-27',
  },
];

// ============ NOMENCLATURE ============
export const nomenclatureItems: NomenclatureItem[] = [
  { id: 'n1', code: '26.20.11', name: 'Ноутбук Dell Latitude 5540', group: 'Компьютеры и ноутбуки', unit: 'шт' },
  { id: 'n2', code: '26.20.12', name: 'Ноутбук Lenovo ThinkPad E15', group: 'Компьютеры и ноутбуки', unit: 'шт' },
  { id: 'n3', code: '26.20.13', name: 'Монитор Samsung 27" 4K', group: 'Мониторы', unit: 'шт' },
  { id: 'n4', code: '26.20.14', name: 'Монитор LG UltraWide 34"', group: 'Мониторы', unit: 'шт' },
  { id: 'n5', code: '26.20.21', name: 'Мышь беспроводная Logitech MX Master 3S', group: 'Периферийные устройства', unit: 'шт' },
  { id: 'n6', code: '26.20.22', name: 'Клавиатура механическая Keychron K2', group: 'Периферийные устройства', unit: 'шт' },
  { id: 'n7', code: '58.29.20', name: 'Microsoft 365 Business Premium (1 год)', group: 'Программное обеспечение', unit: 'лиц' },
  { id: 'n8', code: '58.29.21', name: '1С:Предприятие 8.3 Бухгалтерия', group: 'Программное обеспечение', unit: 'компл' },
  { id: 'n9', code: '26.30.11', name: 'IP-телефон Cisco IP Phone 8841', group: 'Средства связи', unit: 'шт' },
  { id: 'n10', code: '26.20.31', name: 'МФУ HP LaserJet MFP M236sdw', group: 'Оргтехника', unit: 'шт' },
  { id: 'n11', code: '17.23.13', name: 'Бумага А4 80 г/м² 500 листов', group: 'Канцелярские товары', unit: 'пач' },
  { id: 'n12', code: '31.01.11', name: 'Кресло офисное эргономичное', group: 'Мебель', unit: 'шт' },
  { id: 'n13', code: '26.20.41', name: 'Коммутатор Cisco Catalyst 2960-X', group: 'Сетевое оборудование', unit: 'шт' },
  { id: 'n14', code: '26.20.42', name: 'Маршрутизатор MikroTik CCR2004', group: 'Сетевое оборудование', unit: 'шт' },
];

export const nomenclatureGroups = [
  'Компьютеры и ноутбуки', 'Мониторы', 'Периферийные устройства',
  'Программное обеспечение', 'Средства связи', 'Оргтехника',
  'Канцелярские товары', 'Мебель', 'Сетевое оборудование', 'Транспортные услуги',
];

export const units = ['шт', 'лиц', 'компл', 'пач', 'м²', 'кг', 'л', 'упак', 'пог.м', 'час'];

// ============ DASHBOARD CHART DATA ============
export const planFactData = [
  { month: 'Янв', plan: 850000, fact: 780000 },
  { month: 'Фев', plan: 1200000, fact: 950000 },
  { month: 'Мар', plan: 1500000, fact: 1480000 },
  { month: 'Апр', plan: 980000, fact: 860000 },
  { month: 'Май', plan: 2100000, fact: 0 },
  { month: 'Июн', plan: 1800000, fact: 0 },
  { month: 'Июл', plan: 1200000, fact: 0 },
  { month: 'Авг', plan: 900000, fact: 0 },
  { month: 'Сен', plan: 1400000, fact: 0 },
  { month: 'Окт', plan: 1600000, fact: 0 },
  { month: 'Ноя', plan: 2000000, fact: 0 },
  { month: 'Дек', plan: 2500000, fact: 0 },
];

export const budgetPieData = [
  { name: 'ИТ-оборудование', value: 5000000, color: '#1B3F8B' },
  { name: 'Программное обеспечение', value: 2000000, color: '#3B82F6' },
  { name: 'Транспорт', value: 1500000, color: '#0EA5E9' },
  { name: 'Мебель', value: 1200000, color: '#22C55E' },
  { name: 'Охрана', value: 2400000, color: '#F59E0B' },
  { name: 'Коммунальные', value: 3600000, color: '#8B5CF6' },
  { name: 'Прочие', value: 2000000, color: '#6B7280' },
];
