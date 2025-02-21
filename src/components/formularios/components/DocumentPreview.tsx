export function DocumentPreview() {
  return (
    <div className="w-2/3 p-4 bg-white shadow-md rounded-md">
      <h2 className="font-bold text-lg">Vista previa del documento</h2>
      <div className="mt-2 h-64 bg-gray-100 flex items-center justify-center rounded-md">
        <span className="text-gray-500">Aquí se mostrará el documento</span>
      </div>
    </div>
  );
}
