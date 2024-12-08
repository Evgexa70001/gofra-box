import Slider from '../Slider/Slider';
import Catalog from '../Catalog/Catalog';
import Map from '../Map/Map';

const HomePage = () => {
  return (
    <>
      <section id="home">
        <Slider />
      </section>
      <section id="catalog">
        <Catalog />
      </section>
      <section id="address">
        <Map />
      </section>
    </>
  );
};

export default HomePage; 