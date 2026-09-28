const Application = require('../models/Application')
const SortingHatLead = require('../models/SortingHatLead')

// Bular DB'ga ulanishni talab qilmaydi — validateSync() offline ishlaydi.
describe('Application modeli — validatorlar', () => {
  test.each([
    ['+998901234567', true],
    ['+998 90 123 45 67', true],   // bo'shliqlar tozalanadi
    ['901234567', true],            // 9 raqam, 998 avtomatik qo'shiladi
    ['998901234567', true],         // 998 bilan, to'liq
    ['12345', false],               // juda qisqa
    ['+7 901 234 56 78', false],    // 998 bilan boshlanmaydi, 9 raqam ham emas
    ['', false],                    // required — bo'sh string ham xato
  ])("telefon '%s' -> to'g'rimi: %s", (phone, shouldBeValid) => {
    const doc = new Application({ name: 'Test', phone })
    const err = doc.validateSync()
    if (shouldBeValid) expect(err).toBeUndefined()
    else expect(err?.errors?.phone).toBeDefined()
  })

  test.each([
    ['', true],                     // bo'sh — majburiy emas (default: '')
    ['test@example.com', true],
    ['notogri-email', false],
    ['@example.com', false],
  ])("email '%s' -> to'g'rimi: %s", (email, shouldBeValid) => {
    const doc = new Application({ name: 'Test', phone: '+998901234567', email })
    const err = doc.validateSync()
    if (shouldBeValid) expect(err).toBeUndefined()
    else expect(err?.errors?.email).toBeDefined()
  })

  test("name bo'lmasa xato beradi", () => {
    const doc = new Application({ phone: '+998901234567' })
    const err = doc.validateSync()
    expect(err?.errors?.name).toBeDefined()
  })

  test("noto'g'ri type qiymati enum tomonidan rad etiladi", () => {
    const doc = new Application({ name: 'Test', phone: '+998901234567', type: 'notogri' })
    const err = doc.validateSync()
    expect(err?.errors?.type).toBeDefined()
  })

  test("noto'g'ri status qiymati enum tomonidan rad etiladi", () => {
    const doc = new Application({ name: 'Test', phone: '+998901234567', status: 'notogri' })
    const err = doc.validateSync()
    expect(err?.errors?.status).toBeDefined()
  })

  test("standart type 'admission' bo'ladi", () => {
    const doc = new Application({ name: 'Test', phone: '+998901234567' })
    expect(doc.type).toBe('admission')
  })

  test("standart status 'new' bo'ladi", () => {
    const doc = new Application({ name: 'Test', phone: '+998901234567' })
    expect(doc.status).toBe('new')
  })
})

// Band 6 (admin statistika dashboard'i) uchun qo'shilgan model.
describe('SortingHatLead modeli — validatorlar', () => {
  test("name bo'lmasa xato beradi", () => {
    const doc = new SortingHatLead({ phone: '+998901234567' })
    const err = doc.validateSync()
    expect(err?.errors?.name).toBeDefined()
  })

  test("phone bo'lmasa xato beradi", () => {
    const doc = new SortingHatLead({ name: 'Test' })
    const err = doc.validateSync()
    expect(err?.errors?.phone).toBeDefined()
  })

  test("standart faculties bo'sh massiv", () => {
    const doc = new SortingHatLead({ name: 'Test', phone: '+998901234567' })
    expect(doc.faculties).toEqual([])
  })

  test("10 tagacha fakultet qabul qilinadi", () => {
    const doc = new SortingHatLead({
      name: 'Test', phone: '+998901234567',
      faculties: Array.from({ length: 10 }, (_, i) => `F${i}`),
    })
    expect(doc.validateSync()).toBeUndefined()
  })

  test("10 tadan ortiq fakultet rad etiladi (suiiste'moldan himoya)", () => {
    const doc = new SortingHatLead({
      name: 'Test', phone: '+998901234567',
      faculties: Array.from({ length: 11 }, (_, i) => `F${i}`),
    })
    const err = doc.validateSync()
    expect(err?.errors?.faculties).toBeDefined()
  })

  test("200 belgidan uzun fakultet nomi rad etiladi", () => {
    const doc = new SortingHatLead({ name: 'Test', phone: '+998901234567', faculties: ['x'.repeat(201)] })
    const err = doc.validateSync()
    expect(err?.errors?.faculties).toBeDefined()
  })
})