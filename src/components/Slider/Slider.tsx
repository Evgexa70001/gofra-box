import { useState, useEffect } from 'react';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      text: '',
      image: '/slide-1-v.2.jpg',
    },
    {
      id: 2,
      text: '',
      image: '/slide-2-v.2.jpg',
    },
    {
      id: 3,
      text: '',
      image: '/slide-3-v.2.jpg',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-auto overflow-hidden">
      <div className="relative pt-[35%]">
        <div
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '100%',
          }}>
          <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8 lg:px-12">
            {/* <p className="text-3xl font-medium text-center max-w-3x">
              {slides[currentSlide].text}
            </p> */}
          </div>
        </div>
      </div>
      {/* <div className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white w-8 h-8 md:w-10 md:h-10 rounded-[100%] transition-all duration-300 ease-in-out hover:bg-gray-200">
        <button
          className="transform translate-x-1/2 md:translate-x-2/3 text-xl md:text-2xl text-black z-10"
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}>
          &lt;
        </button>
      </div>

      <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white w-8 h-8 md:w-10 md:h-10 rounded-[100%] transition-all duration-300 ease-in-out hover:bg-gray-200">
        <button
          className="transform translate-x-1/3 md:translate-x-3 text-xl md:text-2xl text-black z-10"
          onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}>
          &gt;
        </button>
      </div> */}
    </section>
  );
};

export default Slider;
