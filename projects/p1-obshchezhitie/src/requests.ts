export const categories = ['Сантехника', 'Электрика', 'Мебель', 'Интернет'] as const
export const statuses = ['Новая', 'В работе', 'Готово'] as const
export type Category = typeof categories[number]
export type Status = typeof statuses[number]

export interface RequestDraft {
  title: string
  room: string
  category: Category
  details: string
  urgent: boolean
}

export interface DormRequest extends RequestDraft {
  id: string
  status: Status
}

export const initialRequests: DormRequest[] = [
  { id: 'dorm-1', title: 'Протекает труба под раковиной', room: '207', category: 'Сантехника', status: 'Новая', urgent: true, details: 'Вода скапливается на полу после использования раковины.' },
  { id: 'dorm-2', title: 'Мигает потолочный светильник', room: '315', category: 'Электрика', status: 'В работе', urgent: false, details: 'Светильник начинает мигать через несколько минут после включения.' },
  { id: 'dorm-3', title: 'Расшаталась дверца шкафа', room: '108', category: 'Мебель', status: 'Готово', urgent: false, details: 'Дверца провисала из-за ослабленной верхней петли.' },
  { id: 'dorm-4', title: 'Пропадает подключение к Wi-Fi', room: '412', category: 'Интернет', status: 'Новая', urgent: false, details: 'Соединение обрывается несколько раз за вечер.' },
  { id: 'dorm-5', title: 'Заедает ящик письменного стола', room: '223', category: 'Мебель', status: 'Новая', urgent: false, details: 'Нижний ящик открывается только наполовину.' },
]
