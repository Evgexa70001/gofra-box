const Map = () => {
  return (
    <section className="w-full mb-20">
      <h2 className="text-3xl font-bold mb-8">Наш адрес</h2>
      <div className="h-[400px]">
        <iframe
          src="https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=77674865478"
          width="100%"
          height="400"
          frameBorder="0"
          title="Яндекс Карта"
          className="w-full"
        />
      </div>
    </section>
  );
};

export default Map;
