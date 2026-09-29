const modules = ["Склад", "Заявки", "Погодження", "Задачі"];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Opero 0.1.0</p>
        <h1>Контроль внутрішніх операцій в одному просторі</h1>
        <p className="lead">Склад, заявки, погодження та задачі для щоденної роботи команди.</p>
      </section>
      <section className="modules" aria-label="Модулі Opero">
        {modules.map((module) => (
          <article key={module} className="module-card">
            <h2>{module}</h2>
            <p>Модуль готується до підключення.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

