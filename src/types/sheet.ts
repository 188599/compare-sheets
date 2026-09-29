import { utils } from '@e965/xlsx';

export interface SheetRow {
  [key: string]: string | number;
}

export interface SheetPreset {
  id: string;
  name: string;
  description: string;
  startingLine: number;
  idCol: string;
  idRegex?: string;
  codeColOrRegex: string | RegExp;
  valCol: string;
  valMatcherCol?: string;
  valMatcherRegex?: string;
  ignoreZero?: boolean;
  isCredit: boolean;
}

export interface SheetData {
  fileName?: string;
  columns?: string[];
  rows?: SheetRow[];
  activePresetId?: string;
  idCol?: string;
  valCol?: string;
}

export class SheetData {
  static interpretColumn(column: string) {
    return utils.decode_cell(column + 1).c;
  }

  static interpretSheet(sheet: string[][], sheetConfig: SheetPreset) {
    const rows: SheetRow[] = [];
    let index = sheetConfig.startingLine - 1;
    const idCol = SheetData.interpretColumn(sheetConfig.idCol);
    const valCol = SheetData.interpretColumn(sheetConfig.valCol);

    while (index < sheet.length) {
      const row = sheet[index];

      if (row == null) {
        break;
      }

      let currentValueRow: null | number = null;

      const currentId = (
        sheetConfig.idRegex ?
          new RegExp(sheetConfig.idRegex).exec(row[idCol])?.[0]
        : row[idCol])?.trim();

      if (sheetConfig.valMatcherCol) {
        const valMatcherCol = SheetData.interpretColumn(
          sheetConfig.valMatcherCol,
        );
        const valMatcherRegex = new RegExp(sheetConfig.valMatcherRegex ?? '');

        // looks for the value row for the current id
        sheet.slice(index + 1).some((row, idx) => {
          if (valMatcherRegex.test(row[valMatcherCol])) {
            currentValueRow = index + 1 + idx;

            return true;
          }

          return false;
        });

        // if null
        if (currentValueRow == null) {
          // break the loop, last value has been found
          break;
        }
      } else {
        currentValueRow = index;
      }

      const currentValue = Number(sheet[currentValueRow][valCol]);

      if (
        currentId != null &&
        currentId != '' &&
        (!sheetConfig.ignoreZero || (currentValue != null && currentValue != 0))
      ) {
        let currentCode: number;
        currentCode = Number(
          typeof sheetConfig.codeColOrRegex == 'string' ?
            row[SheetData.interpretColumn(sheetConfig.codeColOrRegex)]
          : sheetConfig.codeColOrRegex.exec(row[idCol])![0],
        );

        debugger;

        rows.push({
          COD: currentCode,
          [sheetConfig.idCol]: currentId,
          [sheetConfig.valCol]:
            !sheetConfig.isCredit ? currentValue : -currentValue,
        });
      }

      index = currentValueRow + 1;
    }

    return { rows, columns: ['COD', sheetConfig.idCol, sheetConfig.valCol] };
  }
}

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
