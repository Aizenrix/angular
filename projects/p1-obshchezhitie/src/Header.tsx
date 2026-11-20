export default function Header({ newCount }: { newCount: number }) {
  return (
    <header>
      <div className="header-inner">
        <div>
          <h1>Заявки в общежитие</h1>
          <p>Заявки жильцов коменданту</p>
        </div>
        <span className="new-count">Новых заявок: <strong>{newCount}</strong></span>
      </div>
    </header>
  )
}
