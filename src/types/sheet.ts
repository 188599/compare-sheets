import { utils } from '@e965/xlsx';

export interface ComparisonMatch {
  id: string;
  value: number;
  codeA: number;
  codeB: number;
}

export interface ComparisonMismatch {
  id: string;
  valA: number;
  codeA: number;
  valB: number;
  codeB: number;
  variance: number;
}

export interface ComparisonResults {
  matches: ComparisonMatch[];
  mismatches: ComparisonMismatch[];
  missingInB: { id: string; value: number; code: number }[];
  missingInA: { id: string; value: number; code: number }[];
}

export interface SheetPreset {
  id: string;
  name: string;
  description: string;
  sheetBuilder: (sheet: (string | number)[][]) => Sheet<any>;
}

export interface SheetRow {
  [key: string]: string | number;
}

export interface SheetData {
  fileName?: string;
  columns?: string[];
  rows?: SheetRow[];
  activePresetId?: string;
}

export const COLUMN_LABELS = {
  CODE: 'COD',
  ID: 'ID',
  VALUE: 'VALUE',
};

abstract class Sheet<THeader extends readonly string[]> {
  protected readonly sheet: (string | number)[][];
  protected readonly headers: THeader;

  private _data: { rows: SheetRow[]; columns: string[] } | null = null;

  public get data() {
    if (this._data == null) {
      this._data = this.interpretData();
    }

    return this._data;
  }

  constructor(sheet: (string | number)[][], headers: THeader) {
    this.sheet = sheet;
    this.headers = headers;
  }

  protected abstract interpretData(): { rows: SheetRow[]; columns: string[] };

  protected findRow(headers: string[] | readonly string[]) {
    const rowIndex = this.sheet.findIndex((row) => {
      const rowSet = new Set(
        row.map((cell) => (typeof cell == 'string' ? cell.trim() : cell)),
      );

      return headers.every((cell) => rowSet.has(cell));
    });

    return rowIndex;
  }

  protected findColumn(headersRow: number, header: THeader[number]) {
    return this.sheet[headersRow].findIndex((cell) => cell === header);
  }

  protected encodeCellColumn(column: number) {
    return utils.encode_cell({ c: column, r: 0 }).slice(0, -1);
  }
}

const BALANCETE_HEADERS = [
  'Código',
  'Classificação',
  'Descrição da conta',
  'Saldo Anterior',
  'Débito',
  'Crédito',
  'Saldo Atual',
] as const;

export class BalanceteSheet extends Sheet<typeof BALANCETE_HEADERS> {
  private isCredit: boolean;

  constructor(sheet: (string | number)[][], isCredit: boolean) {
    super(sheet, BALANCETE_HEADERS);
    this.isCredit = isCredit;
  }

  protected interpretData(): { rows: SheetRow[]; columns: string[] } {
    const headersRow = this.findRow(this.headers);
    const firstValueRow =
      this.findRow([this.isCredit ? 'FORNECEDORES' : 'CLIENTES A RECEBER']) +
      (this.isCredit ? 2 : 1);
    const lastValueRow = this.findRow(['RESUMO DO BALANCETE']) - 1;

    const codeColumn = this.findColumn(headersRow, 'Código');
    const idColumn = this.findColumn(headersRow, 'Descrição da conta');
    const valueColumn = this.findColumn(headersRow, 'Saldo Atual');

    const rows: SheetRow[] = [];

    for (let index = firstValueRow; index <= lastValueRow; index++) {
      const row = this.sheet[index];

      const trim = (value: string | number) =>
        typeof value == 'string' ? value.trim() : value;

      const code = trim(row[codeColumn]);
      const id = trim(row[idColumn]);
      const value = row[valueColumn] as number;

      if (value > 0 || value < 0) {
        rows.push({
          [COLUMN_LABELS.CODE]: code,
          [COLUMN_LABELS.ID]: id,
          [COLUMN_LABELS.VALUE]: this.isCredit ? -value : value,
        });
      }
    }

    return {
      rows,
      columns: [COLUMN_LABELS.CODE, COLUMN_LABELS.ID, COLUMN_LABELS.VALUE],
    };
  }
}

const CONTAS_A_RECEBER_HEADERS = [
  'Documento',
  'Emissão',
  'Saída',
  'Vencimento',
  'V. Parcela',
  'V. Recebido',
  'Juros',
  'Multa',
  'Outras',
  'Desconto',
  'Devolução',
  'Saldo',
  'Situação',
] as const;

export class ContasAReceberSheet extends Sheet<
  typeof CONTAS_A_RECEBER_HEADERS
> {
  constructor(sheet: (string | number)[][]) {
    super(sheet, CONTAS_A_RECEBER_HEADERS);
  }

  protected interpretData(): { rows: SheetRow[]; columns: string[] } {
    const headersRow = this.findRow(this.headers);
    const firstValueRow = headersRow + 1;
    const lastValueRow = this.findRow(['Total Geral:']) - 1;

    const codeIdColumn = this.findColumn(headersRow, 'Documento');
    const valueColumn = this.findColumn(headersRow, 'Saldo');

    const rows: SheetRow[] = [];

    let currentCodeId: string;

    for (let index = firstValueRow; index <= lastValueRow; ) {
      const row = this.sheet[index];

      const trim = (value: string | number) =>
        typeof value == 'string' ? value.trim() : value;

      const codeIdRegex = /^(?<code>\d+)\s-\s(?<id>.+)$/;

      const codeId = trim(row[codeIdColumn]) as string;

      if (codeIdRegex.test(codeId)) {
        currentCodeId = codeId;
      } else if (codeId == '') {
        const { code, id } = codeIdRegex.exec(currentCodeId!)!.groups!;
        const value = row[valueColumn];

        rows.push({
          [COLUMN_LABELS.CODE]: Number(code),
          [COLUMN_LABELS.ID]: id,
          [COLUMN_LABELS.VALUE]: value,
        });
      }

      index++;
    }

    return {
      rows,
      columns: [COLUMN_LABELS.CODE, COLUMN_LABELS.ID, COLUMN_LABELS.VALUE],
    };
  }
}

const CONTAS_A_PAGAR_HEADERS = [
  'Documento',
  'Emissão',
  'Entrada',
  'Vencimento',
  'V. Parcela',
  'Valor Pago',
  'Juros',
  'Multa',
  'Outras',
  'Desconto',
  'Devolução',
  'Saldo',
  'Situação',
] as const;

export class ContasAPagarSheet extends Sheet<typeof CONTAS_A_PAGAR_HEADERS> {
  constructor(sheet: (string | number)[][]) {
    super(sheet, CONTAS_A_PAGAR_HEADERS);
  }

  protected interpretData(): { rows: SheetRow[]; columns: string[] } {
    const headersRow = this.findRow(this.headers);
    const firstValueRow = headersRow + 1;
    const lastValueRow = this.findRow(['Total Geral:']) - 1;

    const codeIdColumn = this.findColumn(headersRow, 'Documento');
    const valueColumn = this.findColumn(headersRow, 'Saldo');

    const rows: SheetRow[] = [];

    let currentCodeId: string;

    for (let index = firstValueRow; index <= lastValueRow; ) {
      const row = this.sheet[index];

      const trim = (value: string | number) =>
        typeof value == 'string' ? value.trim() : value;

      const codeIdRegex = /^(?<code>\d+)\s-\s(?<id>.+)$/;

      const codeId = trim(row[codeIdColumn]) as string;

      if (codeIdRegex.test(codeId)) {
        currentCodeId = codeId;
      } else if (codeId == '') {
        const { code, id } = codeIdRegex.exec(currentCodeId!)!.groups!;
        const value = row[valueColumn];

        rows.push({
          [COLUMN_LABELS.CODE]: Number(code),
          [COLUMN_LABELS.ID]: id,
          [COLUMN_LABELS.VALUE]: value,
        });
      }

      index++;
    }

    return {
      rows,
      columns: [COLUMN_LABELS.CODE, COLUMN_LABELS.ID, COLUMN_LABELS.VALUE],
    };
  }
}
