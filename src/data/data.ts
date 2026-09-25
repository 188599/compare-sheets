import type { SheetPreset } from '../types/sheet';

export const initialPresets: SheetPreset[] = [
  {
    id: 'preset-1',
    name: 'BALANCETE',
    description: 'Balancete padrão.',
    startingLine: 13,
    idCol: 'D',
    valCol: 'N',
    ignoreZero: true
  },
  {
    id: 'preset-2',
    name: 'CONTAS A RECEBER',
    description: 'Contas a receber padrão.',
    startingLine: 7,
    idCol: 'E',
    idRegex: '(?<=\\d+\\s-\\s).+$',
    valCol: 'V',
    valMatcherCol: 'I',
    valMatcherRegex: 'Sub Total:',
  },
];