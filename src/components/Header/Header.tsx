import { useEffect, useState } from 'react';
import { Package, Menu, X } from 'lucide-react';
import CallButton from './CallButton';
import SocialLinks from './SocialLinks';

interface HeaderProps {
  id?: string;
  role?: string;
  'aria-label'?: string;
}

function Header({}: HeaderProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');

    const checkVisibleSections = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section) => {
        const { top, bottom } = section.getBoundingClientRect();
        const sectionTop = top + window.scrollY;
        const sectionBottom = bottom + window.scrollY;

        if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
          setActiveSection(section.id);
        }
      });
    };

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px',
    };

    const observer = new IntersectionObserver(checkVisibleSections, observerOptions);
    sections.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
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
      behavior: 'smooth',
    });

    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <a
            href="#home"
            onClick={handleNavClick}
            className="flex items-center gap-2 text-dark font-bold text-xl hover:text-primary transition-colors">
            <Package size={24} />
            <span className="font-['Playfair_Display'] text-2xl">Гофра-Тара</span>
          </a>

          <nav className="hidden md:flex space-x-6">
            <a
              href="#home"
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'home' ? 'text-primary' : 'text-dark hover:text-primary'
              }`}>
              Главная
            </a>
            <a
              href="#faq"
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'faq' ? 'text-primary' : 'text-dark hover:text-primary'
              }`}>
              Информация
            </a>
            <a
              href="#catalog"
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'catalog' ? 'text-primary' : 'text-dark hover:text-primary'
              }`}>
              Каталог
            </a>

            <a
              href="#address"
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'address' ? 'text-primary' : 'text-dark hover:text-primary'
              }`}>
              Адрес
            </a>
            <a
              href="#footer"
              onClick={handleNavClick}
              className={`transition-colors ${
                activeSection === 'footer' ? 'text-primary' : 'text-dark hover:text-primary'
              }`}>
              О нас
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-6">
            <SocialLinks />
            <CallButton />
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <a
                href="#home"
                onClick={handleNavClick}
                className={`transition-colors ${
                  activeSection === 'home' ? 'text-primary' : 'text-dark hover:text-primary'
                }`}>
                Главная
              </a>
              <a
                href="#catalog"
                onClick={handleNavClick}
                className={`transition-colors ${
                  activeSection === 'catalog' ? 'text-primary' : 'text-dark hover:text-primary'
                }`}>
                Каталог
              </a>
              <a
                href="#address"
                onClick={handleNavClick}
                className={`transition-colors ${
                  activeSection === 'address' ? 'text-primary' : 'text-dark hover:text-primary'
                }`}>
                Адрес
              </a>
              <a
                href="#footer"
                onClick={handleNavClick}
                className={`transition-colors ${
                  activeSection === 'footer' ? 'text-primary' : 'text-dark hover:text-primary'
                }`}>
                О нас
              </a>
            </nav>
            <div className="flex flex-col space-y-4 mt-4">
              <SocialLinks />
              <CallButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
