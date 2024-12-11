import { useState } from 'react';
import styles from './FAQ.module.css';

interface FAQItem {
  question: string;
  answer: string | string[];
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: 'Оформление заказа',
    items: [
      {
        question: 'Как сделать заказ?',
        answer: [
          'Заказ можно оформить несколькими способами:',
          '- По телефону +7 (928) 929-06-89',
          '- По телефону +7 (928) 006-21-26',
          '- Через онлайн мессенджеры в чате',
        ],
      },
      {
        question: 'Какая минимальная партия?',
        answer: [
          'Минимальная партия зависит от типа коробки:',
          '- Стандартные размеры: от 100 шт.',
          '- Индивидуальные размеры: от 1000 шт.',
        ],
      },
      {
        question: 'Можно ли сделать доставку?',
        answer: [
          'Доставка осуществляется по всей России. Стоимость доставки зависит от региона и объема заказа.',
          '- Доставка осуществляется транспортными компаниями.',
          '- Доставка в день заказа (при наличии товара).',
          '- Можно забрать самим',
        ],
      },
    ],
  },
];

const FAQ = () => {
  const [activeSection, setActiveSection] = useState<number>(0);
  const [activeItems, setActiveItems] = useState<number[]>([]);

  const toggleItem = (itemIndex: number) => {
    setActiveItems((prev) =>
      prev.includes(itemIndex) ? prev.filter((i) => i !== itemIndex) : [...prev, itemIndex],
    );
  };

  return (
    <div className={styles.faq}>
      <h2>Часто задаваемые вопросы</h2>

      <div className={styles.sections}>
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className={styles.section}>
            <h3 className={styles.sectionTitle} onClick={() => setActiveSection(sectionIndex)}>
              {section.title}
            </h3>

            {activeSection === sectionIndex && (
              <div className={styles.items}>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className={styles.item}>
                    <div
                      className={`${styles.question} ${
                        activeItems.includes(itemIndex) ? styles.active : ''
                      }`}
                      onClick={() => toggleItem(itemIndex)}>
                      {item.question}
                      <span className={styles.arrow}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 10L12 15L17 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>

                    <div
                      className={`${styles.answer} ${
                        activeItems.includes(itemIndex) ? styles.show : ''
                      }`}>
                      <div className={styles.answerContent}>
                        {Array.isArray(item.answer) ? (
                          item.answer.map((line, i) => <p key={i}>{line}</p>)
                        ) : (
                          <p>{item.answer}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
