import { Card } from "../../UI/card";
import Button from "../../UI/button";
import { Checkbox } from "../../UI/checkbox";
import { Send } from "lucide-react";

type FormatSelectorProps = Readonly<{
  selectedFormats: {
    solicitud: boolean;
    datos: boolean;
  };
  onCheckboxChange: (format: "solicitud" | "datos") => void;
}>;

export function FormatSelector({
  selectedFormats,
  onCheckboxChange,
}: FormatSelectorProps) {
  return (
    <Card className="w-1/2 p-4 bg-white shadow-md">
      <h2 className="font-bold text-lg">Formatos</h2>
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedFormats.solicitud}
            onCheckedChange={() => onCheckboxChange("solicitud")}
          />
          <label htmlFor="solicitud" className="cursor-pointer">
            Formato de Solicitud de Registro
          </label>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            checked={selectedFormats.datos}
            onCheckedChange={() => onCheckboxChange("datos")}
          />
          <label htmlFor="datos" className="cursor-pointer">
            Formato de Datos Informativos
          </label>
        </div>
      </div>
      <Button className="mt-4 w-full flex items-center gap-2">
        <Send size={16} /> Enviar
      </Button>
    </Card>
  );
}
