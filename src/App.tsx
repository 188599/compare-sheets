import { type ChangeEvent, useState } from 'react';
import ComparisonDashboard from './components/ComparisonDashboard';
import Navbar from './components/Navbar';
import SheetConfigPreview from './components/SheetConfigPreview';
import { initialPresets } from './data/data';
import type {
  ComparisonMatch,
  ComparisonMismatch,
  ComparisonResults,
  SheetData,
} from './types/sheet';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Config & Preview, 2: Comparison Results
  const [presets, setPresets] = useState(initialPresets);
  const [sheetA, setSheetA] = useState<SheetData>({});
  const [sheetB, setSheetB] = useState<SheetData>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [comparisonResults, setComparisonResults] =
    useState<ComparisonResults | null>(null);

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    target: 'A' | 'B',
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      if (target === 'A') {
        setSheetA((prev) => ({ ...prev, fileName: file.name }));
      } else {
        setSheetB((prev) => ({ ...prev, fileName: file.name }));
      }
    }
  };

  const handleRunComparison = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const mapA = new Map(
        sheetA.rows!.map((r) => [
          r[sheetA.idCol!] as string,
          { code: r['COD'] as number, value: r[sheetA.valCol!] as number },
        ]),
      );
      const mapB = new Map(
        sheetB.rows!.map((r) => [
          r[sheetB.idCol!] as string,
          { code: r['COD'] as number, value: r[sheetB.valCol!] as number },
        ]),
      );

      const matches: ComparisonMatch[] = [];
      const mismatches: ComparisonMismatch[] = [];
      const missingInB: ComparisonResults['missingInB'] = [];
      const missingInA: ComparisonResults['missingInA'] = [];

      mapA.forEach(({ value: valA, code: codeA }, id) => {
        if (mapB.has(id)) {
          const { value: valB, code: codeB } = mapB.get(id)!;
          if (valA === valB) {
            matches.push({ id: id, value: valA, codeA, codeB });
          } else {
            mismatches.push({
              id,
              valA,
              codeA,
              valB,
              codeB,
              variance: valB - valA,
            });
          }
        } else {
          missingInB.push({ id, value: valA, code: codeA });
        }
      });

      mapB.forEach(({ code, value }, id) => {
        if (!mapA.has(id)) {
          missingInA.push({ id, value, code });
        }
      });

      setComparisonResults({ matches, mismatches, missingInB, missingInA });
      setIsProcessing(false);
      setCurrentStep(2);
    }, 800);
  };

  const canCompare =
    (sheetA.rows?.length ?? 0) > 0 && (sheetB.rows?.length ?? 0) > 0;

  return (
    <div className="dark bg-gray-900 min-h-screen text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {currentStep === 1 ?
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Reconciliação de Planilhas Excel
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Faça upload de suas planihas, configure conforme seus dados e
                inspecione instantaneamente com destaque em tempo real antes de
                comparar.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <SheetConfigPreview
                sheet={sheetA}
                setSheet={setSheetA}
                sheetTitle="Planilha A (Origem)"
                onFileChange={(e) => handleFileUpload(e, 'A')}
                presets={presets}
                // onAddPreset={(newPreset) =>
                //   setPresets((prev) => [...prev, newPreset])
                // }
              />
              <SheetConfigPreview
                sheet={sheetB}
                setSheet={setSheetB}
                sheetTitle="Planilha B (Alvo)"
                onFileChange={(e) => handleFileUpload(e, 'B')}
                presets={presets}
                // onAddPreset={(newPreset) =>
                //   setPresets((prev) => [...prev, newPreset])
                // }
                onRunComparison={handleRunComparison}
                isProcessing={isProcessing}
                canCompare={canCompare}
              />
            </div>
          </div>
        : comparisonResults && (
            <ComparisonDashboard
              sheetA={sheetA}
              sheetB={sheetB}
              results={comparisonResults}
              onReset={() => setCurrentStep(1)}
            />
          )
        }
      </main>
    </div>
  );
}
