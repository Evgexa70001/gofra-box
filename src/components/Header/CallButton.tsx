import { useState } from 'react';
import { Phone } from 'lucide-react';

const CallButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumbers = [
    { number: '+7 (928) 929-06-89', label: 'Основной' },
    { number: '+7 (928) 006-21-26', label: 'Дополнительный' },
  ];

  return (
    <div className="relative">
      <button
        className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}>
        <Phone size={20} />
        <span>Позвонить</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            {phoneNumbers.map((phone) => (
              <a
                key={phone.number}
                href={`tel:${phone.number.replace(/[^\d+]/g, '')}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Phone size={16} className="mr-2" />
                <div>
                  <div className="font-medium">{phone.number}</div>
                  <div className="text-xs text-gray-500">{phone.label}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallButton;
