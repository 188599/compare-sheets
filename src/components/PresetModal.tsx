import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  TextInput,
  Textarea,
} from 'flowbite-react';
import { useState, type SubmitEvent } from 'react';
import type { SheetData, SheetPreset } from '../types/sheet';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreset: (newPreset: SheetPreset) => void;
  sheet: SheetData;
}

export default function PresetModal({
  isOpen,
  onClose,
  onSavePreset,
  sheet,
}: PresetModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startingLine, setStartingLine] = useState(0);
  const [idCol, setIdCol] = useState(sheet.columns?.[0] || '');
  const [idRegex, setIdRegex] = useState<string>();
  const [valCol, setValCol] = useState(sheet.columns?.[0] || '');
  const [valMatcherCol, setValMatcherCol] = useState<string>();
  const [valMatcherRegex, setValMatcherRegex] = useState<string>();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPreset: SheetPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      startingLine,
      idCol,
      idRegex,
      valCol,
      valMatcherCol,
      valMatcherRegex,
    };

    onSavePreset(newPreset);
    setName('');
    setDescription('');
    setStartingLine(0);
    setIdCol(sheet.columns?.[0] || '');
    setIdRegex(undefined);
    setValCol(sheet.columns?.[0] || '');
    setValMatcherCol(undefined);
    setValMatcherRegex(undefined);
    onClose();
  };

  return (
    <>
      {sheet.columns && (
        <Modal show={isOpen} onClose={onClose} size="lg">
          <form onSubmit={handleSubmit}>
            <ModalHeader>Criar Nova Configuração Preset</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="presetName">Nome Preset</Label>
                  <TextInput
                    id="presetName"
                    required
                    placeholder="Nome Preset"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="presetDesc">Descrição</Label>
                  <Textarea
                    id="presetDesc"
                    placeholder="Descrição"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="startingLine">Linha Inicial</Label>
                    <TextInput
                      id="startingLine"
                      type="number"
                      required
                      value={startingLine}
                      onChange={(e) => setStartingLine(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modalIdCol">Coluna ID</Label>
                    <Select
                      id="modalIdCol"
                      value={idCol}
                      onChange={(e) => setIdCol(e.target.value)}
                    >
                      {sheet.columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="idRegex">Coluna ID Regex (Opcional)</Label>
                    <TextInput
                      id="idRegex"
                      value={idRegex}
                      onChange={(e) => setIdRegex(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modalValCol">Coluna Valor</Label>
                    <Select
                      id="modalValCol"
                      value={valCol}
                      onChange={(e) => setValCol(e.target.value)}
                    >
                      {sheet.columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valMatcherCol">
                      Coluna Descrição de Valor (Opcional)
                    </Label>
                    <Select
                      id="valMatcherCol"
                      value={valCol}
                      onChange={(e) => setValMatcherCol(e.target.value)}
                    >
                      {sheet.columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="valMatcherRegex">
                      Coluna Descrição de Valor Regex (Opcional)
                    </Label>
                    <TextInput
                      id="valMatcherRegex"
                      value={idRegex}
                      onChange={(e) => setValMatcherRegex(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                className="bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:bg-linear-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
              >
                Save Preset
              </Button>
              <Button color="gray" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </>
  );
}
