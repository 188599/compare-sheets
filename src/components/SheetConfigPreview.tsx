import { read, utils } from '@e965/xlsx';
import {
  ArrowRightIcon,
  ArrowUpOnSquareIcon,
  CurrencyDollarIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import {
  Badge,
  Button,
  Card,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useState,
} from 'react';
import { SheetData, type SheetPreset } from '../types/sheet';
import PresetModal from './PresetModal';

interface SheetConfigPreviewProps {
  sheet: SheetData;
  setSheet: Dispatch<SetStateAction<SheetData>>;
  sheetTitle: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  presets: SheetPreset[];
  onAddPreset: (newPreset: SheetPreset) => void;
  onRunComparison?: () => void;
  isProcessing?: boolean;
  canCompare?: boolean;
}

export default function SheetConfigPreview({
  sheet,
  setSheet,
  sheetTitle,
  onFileChange,
  presets,
  onAddPreset,
  onRunComparison,
  isProcessing = false,
  canCompare = false,
}: SheetConfigPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheetAsJson, setSheetAsJson] = useState<string[][]>();

  const handlePresetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'ADD_NEW') {
      setIsModalOpen(true);
      return;
    }
    const found = presets.find((p) => p.id === val);

    const newSheetValue: SheetData = {
      ...sheet,
      activePresetId: found?.id,
      idCol: found?.idCol,
      valCol: found?.valCol,
    };

    if (sheetAsJson != null && found) {
      const { rows, columns } = SheetData.interpretSheet(sheetAsJson!, found);

      newSheetValue.columns = columns;
      newSheetValue.rows = rows;
    }

    setSheet(newSheetValue);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const readXlsx = async (file: File) => {
        const ab = await file.arrayBuffer();
        const wb = read(ab, { type: 'array' });

        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = utils.sheet_to_json<string[]>(ws, {
          header: 1,
          defval: '',
        });

        return data;
      };

      setSheetAsJson(await readXlsx(file));
    }

    onFileChange(e);
  };

  const activePreset = presets.find((p) => p.id === sheet.activePresetId);

  return (
    <Card className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {sheetTitle}
        </h3>
        {sheet.fileName && <Badge color="info">{sheet.fileName}</Badge>}
      </div>

      {/* Upload simulator */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600">
          <div className="flex flex-col items-center justify-center pt-2 pb-3">
            <ArrowUpOnSquareIcon className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click para fazer upload</span> ou
              arraste .xlsx
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Preset Selector */}
      <div className="mt-3">
        {/* <div className="flex justify-between items-center mb-1">
          <Label htmlFor={`${sheetTitle}-preset`} />
          <span
            className="text-xs text-cyan-600 dark:text-cyan-400 cursor-pointer font-medium"
            onClick={() => setIsModalOpen(true)}
          >
            + Novo Preset
          </span>
        </div> */}
        <Select
          id={`${sheetTitle}-preset`}
          value={sheet.activePresetId}
          onChange={handlePresetChange}
          sizing="sm"
        >
          <option value=""></option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          {/* <option value="ADD_NEW" className="font-bold text-cyan-600">
            + Adicionar Novo Preset...
          </option> */}
        </Select>
        {activePreset && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
            {activePreset.description}
          </p>
        )}
      </div>

      {/* Live Highlighted Preview Table with Row Highlighting */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Dados em Tempo Real
          </span>
          <span className="text-xs text-gray-400">
            Mostrando mapeamento de chaves
          </span>
        </div>
        <div className="overflow-x-auto max-h-48 border rounded-lg dark:border-gray-700">
          {sheet.columns != null && sheet.activePresetId && (
            <Table hoverable>
              <TableHead>
                <TableRow>
                  {sheet.columns.map((col) => {
                    const isId = col === sheet.idCol;
                    const isVal = col === sheet.valCol;
                    return (
                      <TableHeadCell
                        key={col}
                        className={`${
                          isId ?
                            'bg-cyan-100 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100'
                          : isVal ?
                            'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                          : ''
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {isId && (
                            <KeyIcon className="w-3.5 h-3.5 text-cyan-600" />
                          )}
                          {isVal && (
                            <CurrencyDollarIcon className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {col}
                        </div>
                      </TableHeadCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {sheet.rows!.map((row, idx) => (
                  <TableRow
                    key={idx}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    {sheet.columns!.map((col) => {
                      const isId = col === sheet.idCol;
                      const isVal = col === sheet.valCol;
                      return (
                        <TableCell
                          key={col}
                          className={`font-medium ${
                            isId ?
                              'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200'
                            : isVal ?
                              'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                            : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {row[col]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {sheetTitle.includes('Alvo') && onRunComparison ?
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button
            className="bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:bg-linear-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
            onClick={onRunComparison}
            disabled={!canCompare || isProcessing}
          >
            {isProcessing ?
              <>
                <Spinner size="sm" className="mr-2" />
                Processando Comparação...
              </>
            : <>
                Rodar Análise de Comparação
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </>
            }
          </Button>
        </div>
      : /* Empty spacer for Sheet A to keep heights balanced if desired */
        <div className="mt-4 pt-3 border-t border-transparent h-13.25" />
      }

      <PresetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSavePreset={onAddPreset}
        sheet={sheet}
      />
    </Card>
  );
}
