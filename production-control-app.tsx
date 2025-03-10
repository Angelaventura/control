import React, { useState, useEffect } from 'react';

// Componente principal de la aplicación
const ProductionControlApp = () => {
  // Estados para manejar los datos de la aplicación
  const [currentShift, setCurrentShift] = useState('A');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [productionData, setProductionData] = useState([]);
  const [alertThreshold, setAlertThreshold] = useState(3);
  const [historyFilters, setHistoryFilters] = useState({
    date: '',
    shift: '',
    product: '',
    weight: ''
  });
  const [showHistory, setShowHistory] = useState(false);

  // Datos de ejemplo para la demostración
  useEffect(() => {
    // En una implementación real, estos datos vendrían de IndexedDB
    const mockData = [
      {
        id: 1,
        product: 'Papas Clásicas',
        weight: 180,
        target: 250,
        produced: 175,
        pallets: { total: 6, completed: 3, remaining: 3, currentPallet: 28 },
        shifts: { A: true, B: true, C: false, D: true, E: false, F: false },
        nextShiftSameWeight: true,
        nextShiftWeightChange: false
      },
      {
        id: 2,
        product: 'Papas Sabor Queso',
        weight: 150,
        target: 200,
        produced: 190,
        pallets: { total: 5, completed: 4, remaining: 1, currentPallet: 42 },
        shifts: { A: true, B: true, C: true, D: false, E: false, F: true },
        nextShiftSameWeight: false,
        nextShiftWeightChange: true
      },
      {
        id: 3,
        product: 'Chicharrones',
        weight: 100,
        target: 300,
        produced: 210,
        pallets: { total: 7, completed: 5, remaining: 2, currentPallet: 17 },
        shifts: { A: true, B: false, C: true, D: true, E: true, F: false },
        nextShiftSameWeight: true,
        nextShiftWeightChange: false
      }
    ];
    
    setProductionData(mockData);
  }, []);

  // Calcular porcentaje de progreso
  const calculateProgress = (produced, target) => {
    return Math.round((produced / target) * 100);
  };

  // Exportar datos a formato JSON
  const exportData = (format) => {
    let dataStr;
    let fileName;
    
    if (format === 'json') {
      dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(productionData));
      fileName = `production_data_${currentDate}_shift_${currentShift}.json`;
    } else if (format === 'csv') {
      // Implementación simple de exportación CSV
      const headers = "id,product,weight,target,produced,progress\n";
      const csvData = productionData.map(item => 
        `${item.id},${item.product},${item.weight},${item.target},${item.produced},${calculateProgress(item.produced, item.target)}`
      ).join('\n');
      dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + csvData);
      fileName = `production_data_${currentDate}_shift_${currentShift}.csv`;
    }
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Control de Producción (Solo Lectura)</h1>
        <div className="flex justify-between mt-2">
          <div>
            <span className="font-semibold">Fecha: </span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">Turno:</span>
            <select 
              value={currentShift} 
              onChange={(e) => setCurrentShift(e.target.value)}
              className="bg-blue-700 text-white px-2 py-1 rounded"
            >
              {['A', 'B', 'C', 'D', 'E', 'F'].map(shift => (
                <option key={shift} value={shift}>Turno {shift}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {!showHistory ? (
          <>
            <section className="mb-6">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Datos de Producción Actual</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productionData.map(product => {
                  const progress = calculateProgress(product.produced, product.target);
                  let progressColorClass = 'bg-blue-500';
                  
                  if (progress < 40) progressColorClass = 'bg-red-500';
                  else if (progress < 70) progressColorClass = 'bg-yellow-500';
                  else if (progress >= 100) progressColorClass = 'bg-green-500';
                  
                  return (
                    <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg">{product.product}</h3>
                        <span className="px-2 py-1 rounded text-white bg-gray-700">
                          {product.weight}g
                        </span>
                      </div>

                      {/* Alertas */}
                      <div className="mb-2">
                        {product.nextShiftWeightChange && (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-1">
                            <span className="font-bold">ALERTA:</span> Cambio de gramaje próximo turno
                          </div>
                        )}
                        {product.nextShiftSameWeight && !product.nextShiftWeightChange && (
                          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-2 mb-1">
                            <span className="font-bold">AVISO:</span> Mismo gramaje próximo turno
                          </div>
                        )}
                        {product.pallets.remaining <= alertThreshold && (
                          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2">
                            <span className="font-bold">PRECAUCIÓN:</span> Quedan {product.pallets.remaining} tarimas
                          </div>
                        )}
                      </div>

                      {/* Progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso: {progress}%</span>
                          <span>{product.produced} / {product.target} cajas</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div 
                            className={`${progressColorClass} h-4 rounded-full`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Información de Tarimas */}
                      <div className="bg-gray-100 p-2 rounded">
                        <h4 className="font-semibold mb-1">Información de Tarimas</h4>
                        <div className="grid grid-cols-3 text-center text-sm">
                          <div>
                            <div className="font-semibold">Total</div>
                            <div>{product.pallets.total}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Completadas</div>
                            <div>{product.pallets.completed}</div>
                          </div>
                          <div>
                            <div className="font-semibold">Restantes</div>
                            <div>{product.pallets.remaining}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="font-semibold">Tarima actual</div>
                          <div className="bg-white border border-gray-300 rounded py-1">
                            {product.pallets.currentPallet}/49 cajas
                          </div>
                        </div>
                      </div>

                      {/* Turnos programados */}
                      <div className="mt-3">
                        <div className="text-sm font-semibold mb-1">Programado en turnos:</div>
                        <div className="flex space-x-1">
                          {Object.entries(product.shifts).map(([shift, active]) => (
                            <div 
                              key={shift}
                              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                active ? 'bg-blue-600 text-white' : 'bg-gray-200'
                              }`}
                            >
                              {shift}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex justify-end space-x-2 mb-6">
              <button 
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Ver Historial
              </button>
              <button 
                onClick={() => exportData('json')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Exportar JSON
              </button>
              <button 
                onClick={() => exportData('csv')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Exportar CSV
              </button>
            </div>
          </>
        ) : (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold border-b pb-2">Historial de Producción</h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Volver a Producción
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h3 className="font-bold mb-3">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={historyFilters.date}
                    onChange={(e) => setHistoryFilters({...historyFilters, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={historyFilters.shift}
                    onChange={(e) => setHistoryFilters({...historyFilters, shift: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map(shift => (
                      <option key={shift} value={shift}>Turno {shift}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={historyFilters.product}
                    onChange={(e) => setHistoryFilters({...historyFilters, product: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {productionData.map(product => (
                      <option key={product.id} value={product.product}>{product.product}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gramaje</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={historyFilters.weight}
                    onChange={(e) => setHistoryFilters({...historyFilters, weight: e.target.value})}
                  >
                    <option value="">Todos</option>
                    {[...new Set(productionData.map(p => p.weight))].map(weight => (
                      <option key={weight} value={weight}>{weight}g</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>

            {/* Tabla de historial */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gramaje</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumplimiento</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Datos de muestra */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">2025-03-08</td>
                    <td className="px-6 py-4 whitespace-nowrap">A</td>
                    <td className="px-6 py-4 whitespace-nowrap">Papas Clásicas</td>
                    <td className="px-6 py-4 whitespace-nowrap">180g</td>
                    <td className="px-6 py-4 whitespace-nowrap">250</td>
                    <td className="px-6 py-4 whitespace-nowrap">242</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-sm text-white bg-green-500 rounded-full">97%</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">2025-03-08</td>
                    <td className="px-6 py-4 whitespace-nowrap">B</td>
                    <td className="px-6 py-4 whitespace-nowrap">Papas Sabor Queso</td>
                    <td className="px-6 py-4 whitespace-nowrap">150g</td>
                    <td className="px-6 py-4 whitespace-nowrap">200</td>
                    <td className="px-6 py-4 whitespace-nowrap">185</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-sm text-white bg-yellow-500 rounded-full">93%</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">2025-03-07</td>
                    <td className="px-6 py-4 whitespace-nowrap">F</td>
                    <td className="px-6 py-4 whitespace-nowrap">Chicharrones</td>
                    <td className="px-6 py-4 whitespace-nowrap">100g</td>
                    <td className="px-6 py-4 whitespace-nowrap">300</td>
                    <td className="px-6 py-4 whitespace-nowrap">275</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-sm text-white bg-blue-500 rounded-full">92%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => exportData('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Exportar Historial
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>Aplicación de Control de Producción (Modo solo lectura) - © 2025</p>
          <p className="text-sm mt-1">Versión 1.0 - Desarrollada como Progressive Web App</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductionControlApp;
