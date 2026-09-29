const statistics = [
  {
    label: "Очікують погодження",
    value: "12",
    description: "+3 за цей тиждень",
    color: "text-opero-blue",
  },
  {
    label: "Прострочені задачі",
    value: "4",
    description: "Потребують уваги",
    color: "text-red-600",
  },
  {
    label: "Низький залишок",
    value: "7",
    description: "Перевірити склад",
    color: "text-amber-600",
  },
];

const requests = [
  {
    number: "RQ-1048",
    author: "Олена Коваль",
    type: "Видача",
    status: "Очікує",
    statusClass: "bg-amber-100 text-amber-800",
  },
  {
    number: "RQ-1047",
    author: "Ігор Петренко",
    type: "Закупівля",
    status: "Погоджено",
    statusClass: "bg-emerald-100 text-emerald-800",
  },
  {
    number: "RQ-1046",
    author: "Марія Гнатюк",
    type: "Видача",
    status: "Видано",
    statusClass: "bg-emerald-100 text-emerald-800",
  },
];

const tasks = [
  {
    title: "Перевірити заявку RQ-1048",
    deadline: "Сьогодні",
  },
  {
    title: "Оновити мінімальні залишки",
    deadline: "30 вересня",
  },
  {
    title: "Підготувати звіт складу",
    deadline: "2 жовтня",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-3">
        {statistics.map((statistic) => (
          <article key={statistic.label} className="rounded-2xl border border-opero-border bg-white p-5">
            <p className="text-sm font-medium text-opero-muted">{statistic.label}</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${statistic.color}`}>
              {statistic.value}
            </p>
            <p className="mt-2 text-sm text-opero-muted">{statistic.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-opero-border bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-bold text-opero-text">Останні заявки</h2>
            <button type="button" className="text-sm font-semibold text-opero-blue">
              Усі заявки
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-y border-opero-border bg-slate-50 text-xs uppercase tracking-wide text-opero-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Номер</th>
                  <th className="px-5 py-3 font-semibold">Автор</th>
                  <th className="px-5 py-3 font-semibold">Тип</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.number} className="border-b border-opero-border last:border-0">
                    <td className="px-5 py-4 font-semibold text-opero-text">{request.number}</td>
                    <td className="px-5 py-4 text-opero-muted">{request.author}</td>
                    <td className="px-5 py-4 text-opero-muted">{request.type}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${request.statusClass}`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-opero-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-opero-text">Мої задачі</h2>
            <button type="button" className="text-sm font-semibold text-opero-blue">
              Усі
            </button>
          </div>

          <div className="mt-3 divide-y divide-opero-border">
            {tasks.map((task) => (
              <div key={task.title} className="flex items-center gap-3 py-4">
                <span className="size-5 rounded-md border-2 border-slate-300" />
                <p className="min-w-0 flex-1 text-sm font-medium text-opero-text">{task.title}</p>
                <span className="shrink-0 text-xs text-opero-muted">{task.deadline}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm">
            <span className="text-amber-900">Кабель UTP Cat 6</span>
            <strong className="text-amber-700">4 м</strong>
          </div>
        </article>
      </section>
    </div>
  );
}