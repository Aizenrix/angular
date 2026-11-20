migrate((app) => {
  const collection = new Collection({
    name: "obshchezhitie",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: '@request.body.status = "Новая" && @request.body.master:isset = false',
    updateRule: '@request.body.title:isset = false && @request.body.room:isset = false && @request.body.details:isset = false && (@request.body.master:isset = false || (status = "Новая" && @request.body.status = "В работе") || (status = "В работе" && @request.body.status = "Новая" && @request.body.master = ""))',
    deleteRule: 'status = "Готово"',
    fields: [
      { name: "title", type: "text", required: true, max: 120 },
      { name: "room", type: "text", required: true, max: 40 },
      { name: "category", type: "select", required: true, maxSelect: 1, values: ["Сантехника", "Электрика", "Мебель", "Интернет"] },
      { name: "details", type: "text", max: 1500 },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["Новая", "В работе", "Готово"] },
      { name: "urgent", type: "bool" },
      { name: "master", type: "text", max: 120 },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(collection)

  const examples = [
    ["Протекает труба под раковиной", "207", "Сантехника", "Вода скапливается под раковиной.", "Новая", true],
    ["Мигает потолочный светильник", "315", "Электрика", "Начинает мигать через несколько минут.", "В работе", false],
    ["Расшаталась дверца шкафа", "108", "Мебель", "Ослабла верхняя петля.", "Готово", false],
    ["Пропадает подключение к Wi-Fi", "412", "Интернет", "Связь обрывается несколько раз за вечер.", "Новая", false],
    ["Заедает ящик письменного стола", "223", "Мебель", "Нижний ящик открывается наполовину.", "Новая", false],
  ]
  for (const [title, room, category, details, status, urgent] of examples) {
    const record = new Record(collection)
    record.load({ title, room, category, details, status, urgent })
    app.save(record)
  }
}, (app) => {
  app.delete(app.findCollectionByNameOrId("obshchezhitie"))
})
