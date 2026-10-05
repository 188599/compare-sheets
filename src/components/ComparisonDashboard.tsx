import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  Badge,
  Button,
  Card,
  TabItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tabs,
} from 'flowbite-react';
import { useState } from 'react';
import type { ComparisonResults, SheetData } from '../types/sheet';

interface ComparisonDashboardProps {
  sheetA: SheetData;
  sheetB: SheetData;
  results: ComparisonResults;
  onReset: () => void;
}

export default function ComparisonDashboard({
  sheetA,
  sheetB,
  results,
  onReset,
}: ComparisonDashboardProps) {
  const [, setActiveTab] = useState<string>('mismatches');

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex justify-between items-center">
        <Button color="gray" size="sm" onClick={onReset}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Voltar para Configuração
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Valores que batem
              </p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.matches.length}
              </h4>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Valores que não batem
              </p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.mismatches.length}
              </h4>
            </div>
            <ExclamationCircleIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Faltando na Planilha B
              </p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.missingInB.length}
              </h4>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Faltando na Planilha A
              </p>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.missingInA.length}
              </h4>
            </div>
            <XCircleIcon className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filterable Discrepancy Tables */}
      <Card>
        <Tabs
          aria-label="Comparison Results"
          variant="underline"
          onActiveTabChange={(tab) => setActiveTab(String(tab))}
        >
          <TabItem
            active
            title={`Valores que não batem (${results.mismatches.length})`}
          >
            <div className="overflow-x-auto mt-2">
              <Table hoverable>
                <TableHead>
                  <TableRow>
                    <TableHeadCell>ID</TableHeadCell>
                    <TableHeadCell>Cod. A</TableHeadCell>
                    <TableHeadCell>Valor A</TableHeadCell>
                    <TableHeadCell>Cod. B</TableHeadCell>
                    <TableHeadCell>Valor B</TableHeadCell>
                    <TableHeadCell>Diferença</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {results.mismatches.map((item, idx) => (
                    <TableRow
                      key={idx}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <TableCell className="font-semibold">{item.id}</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400">
                        {item.codeA}
                      </TableCell>
                      <TableCell className="text-red-600 dark:text-red-400">
                        {item.valA.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">
                        {item.codeB}
                      </TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">
                        {item.valB.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge color="warning" size="sm">
                          {item.variance.toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabItem>

          <TabItem
            title={`Faltando em uma planilha (${results.missingInB.length + results.missingInA.length})`}
          >
            <div className="overflow-x-auto mt-2">
              <Table hoverable>
                <TableHead>
                  <TableRow>
                    <TableHeadCell>ID</TableHeadCell>
                    <TableHeadCell>Código</TableHeadCell>
                    <TableHeadCell>Valor</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell>Detalhes</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {results.missingInB.map(({ id, code, value }, idx) => (
                    <TableRow key={`b-${idx}`}>
                      <TableCell className="font-semibold">{id}</TableCell>
                      <TableCell className="font-semibold">{code}</TableCell>
                      <TableCell className="font-semibold">
                        {value.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge color="failure">Faltando em Planilha B</Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        Presente em {sheetA.fileName}
                      </TableCell>
                    </TableRow>
                  ))}
                  {results.missingInA.map(({ id, code, value }, idx) => (
                    <TableRow key={`a-${idx}`}>
                      <TableCell className="font-semibold">{id}</TableCell>
                      <TableCell className="font-semibold">{code}</TableCell>
                      <TableCell className="font-semibold">
                        {value.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge color="purple">Faltando em Planilha A</Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        Presente em {sheetB.fileName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabItem>

          <TabItem title={`Valores que batem (${results.matches.length})`}>
            <div className="overflow-x-auto mt-2">
              <Table hoverable>
                <TableHead>
                  <TableRow>
                    <TableHeadCell>ID</TableHeadCell>
                    <TableHeadCell>Código A</TableHeadCell>
                    <TableHeadCell>Código B</TableHeadCell>
                    <TableHeadCell>Valor</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {results.matches.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold">{item.id}</TableCell>
                      <TableCell>
                        {item.codeA}
                      </TableCell>
                      <TableCell>
                        {item.codeB}
                      </TableCell>
                      <TableCell>{item.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge color="success">Idêntico</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabItem>
        </Tabs>
      </Card>
    </div>
  );
}
