import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import CallButton from './CallButton';
import SocialLinks from './SocialLinks';

const Header = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
      threshold: [0.2, 0.5, 0.8],
      rootMargin: '-100px 0px -100px 0px'
    };

    const observerCallback: IntersectionObserverCallback = () => {
      const visibleSections = Array.from(sections).filter(section => {
        const rect = section.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom >= 0;
      });

      if (visibleSections.length > 0) {
        const mostVisible = visibleSections.reduce((prev, current) => {
          const prevBounds = prev.getBoundingClientRect();
          const currentBounds = current.getBoundingClientRect();
          const prevVisibleHeight = Math.min(prevBounds.bottom, window.innerHeight) - Math.max(prevBounds.top, 0);
          const currentVisibleHeight = Math.min(currentBounds.bottom, window.innerHeight) - Math.max(currentBounds.top, 0);
          return currentVisibleHeight > prevVisibleHeight ? current : prev;
        });

        setActiveSection(mostVisible.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;
    
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (!element) return;

    const headerHeight = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <a 
            href="#home"
            onClick={handleNavClick}
            className="flex items-center gap-2 text-dark font-bold text-xl hover:text-primary transition-colors"
          >
            <Package size={24} />
            <span className="font-['Playfair_Display'] text-2xl">Гофра-Тара</span>
          </a>
          
          <nav className="flex space-x-6">
            <a 
              href="#home" 
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'home' 
                  ? 'text-primary' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              Главная
            </a>
            <a 
              href="#catalog" 
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'catalog' 
                  ? 'text-primary' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              Каталог
            </a>
            <a 
              href="#address" 
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'address' 
                  ? 'text-primary' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              Адрес
            </a>
            <a 
              href="#footer" 
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'footer' 
                  ? 'text-primary' 
                  : 'text-dark hover:text-primary'
              }`}
            >
              О нас
            </a>
          </nav>
          
          <div className="flex items-center space-x-6">
            <SocialLinks />
            <CallButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 