import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-light">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4">
        {children}
      </div>
      <Footer id="footer"/>
    </div>
  );
};

export default MainLayout; 