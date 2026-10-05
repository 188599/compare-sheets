import {
  BalanceteSheet,
  ContasAPagarSheet,
  ContasAReceberSheet,
  type SheetPreset,
} from '../types/sheet';

export const initialPresets: SheetPreset[] = [
  {
    id: 'preset-1',
    name: 'BALANCETE (CONTAS A RECEBER)',
    description: 'Balancete contas a receber.',
    sheetBuilder: (sheet) => new BalanceteSheet(sheet, false),
  },
  {
    id: 'preset-2',
    name: 'BALANCETE (CONTAS A PAGAR)',
    description: 'Balancete contas a pagar.',
    sheetBuilder: (sheet) => new BalanceteSheet(sheet, true),
  },
  {
    id: 'preset-3',
    name: 'CONTAS A RECEBER',
    description: 'Contas a receber padrão.',
    sheetBuilder: (sheet) => new ContasAReceberSheet(sheet),
  },
  {
    id: 'preset-4',
    name: 'CONTAS A PAGAR',
    description: 'Contas a pagar padrão.',
    sheetBuilder: (sheet) => new ContasAPagarSheet(sheet),
  },
];
