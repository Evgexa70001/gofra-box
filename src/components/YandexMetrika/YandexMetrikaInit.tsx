declare global {
  interface Window {
    ym: (id: number, action: string, params: any) => void;
  }
}

import { useEffect } from 'react';

const YANDEX_METRIKA_ID = '99168098';

type YandexMetrikaWindow = Window & {
  [key: string]: any;
};

const YandexMetrikaInit = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && YANDEX_METRIKA_ID) {
      try {
        (function (
          m: YandexMetrikaWindow,
          e: Document,
          t: string,
          r: string,
          i: string,
          k: any,
          a: any,
        ) {
          m[i] =
            m[i] ||
            function () {
              (m[i].a = m[i].a || []).push(arguments);
            };
          m[i].l = 1 * new Date().getTime();
          for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) {
              return;
            }
          }
          (k = e.createElement(t)),
            (a = e.getElementsByTagName(t)[0]),
            (k.async = 1),
            (k.src = r),
            (k.onerror = function () {
              console.warn('Не удалось загрузить Яндекс Метрику');
            }),
            a.parentNode.insertBefore(k, a);
        })(
          window as YandexMetrikaWindow,
          document,
          'script',
          'https://mc.yandex.ru/metrika/tag.js',
          'ym',
          undefined,
          undefined,
        );

        window.ym(Number(YANDEX_METRIKA_ID), 'init', {
          defer: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
        });
      } catch (error) {
        console.warn('Ошибка инициализации Яндекс Метрики:', error);
      }
    }
  }, []);

  return null;
};

export default YandexMetrikaInit;
