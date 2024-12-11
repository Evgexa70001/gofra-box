import React from 'react';

interface Material {
  type: string;
  layers: number;
  thickness: string;
  density: string;
  load: string;
  usage: string;
}

const materials: Material[] = [
  {
    type: 'Т21',
    layers: 3,
    thickness: '2,5 мм',
    density: '320 г/м²',
    load: '3,5 кПа',
    usage: 'Легкие товары, почтовые отправления',
  },
  {
    type: 'Т22',
    layers: 3,
    thickness: '3 мм',
    density: '380 г/м²',
    load: '4,2 кПа',
    usage: 'Средние грузы, бытовая техника',
  },
  {
    type: 'Т23',
    layers: 3,
    thickness: '3,2 мм',
    density: '420 г/м²',
    load: '5,0 кПа',
    usage: 'Тяжелые грузы, промышленное оборудование',
  },
  {
    type: 'П31',
    layers: 5,
    thickness: '4 мм',
    density: '520 г/м²',
    load: '7,0 кПа',
    usage: 'Хрупкие товары, особо ценные грузы',
  },
  {
    type: 'П32',
    layers: 5,
    thickness: '4,5 мм',
    density: '560 г/м²',
    load: '8,0 кПа',
    usage: 'Сложные условия транспортировки',
  },
];

const MaterialsTable: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Характеристики материалов</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Тип</th>
              <th className="px-4 py-2 border">Слои</th>
              <th className="px-4 py-2 border">Толщина</th>
              <th className="px-4 py-2 border">Плотность</th>
              <th className="px-4 py-2 border">Нагрузка</th>
              <th className="px-4 py-2 border">Применение</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={material.type} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 border font-medium">{material.type}</td>
                <td className="px-4 py-2 border text-center">{material.layers}</td>
                <td className="px-4 py-2 border text-center">{material.thickness}</td>
                <td className="px-4 py-2 border text-center">{material.density}</td>
                <td className="px-4 py-2 border text-center">{material.load}</td>
                <td className="px-4 py-2 border">{material.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialsTable;
