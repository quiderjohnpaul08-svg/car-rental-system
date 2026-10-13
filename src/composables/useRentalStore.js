import { computed, ref, watch } from 'vue'
import { sampleCars, sampleCustomers, sampleRentals } from '../data/sampleData'

const STORAGE_KEYS = {
  cars: 'simple-car-rental-cars',
  customers: 'simple-car-rental-customers',
  rentals: 'simple-car-rental-rentals',
}

function loadData(key, fallback) {
  if (typeof window === 'undefined') return fallback

  const saved = window.localStorage.getItem(key)
  if (!saved) return fallback

  try {
    return JSON.parse(saved)
  } catch {
    return fallback
  }
}

function saveData(key, value) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function copyData(data) {
  return JSON.parse(JSON.stringify(data))
}

function cleanText(value) {
  return String(value || '').trim()
}

function cleanPlate(value) {
  return cleanText(value).toUpperCase()
}

function dateToTime(dateValue) {
  return new Date(`${dateValue}T00:00:00`).getTime()
}

const cars = ref(loadData(STORAGE_KEYS.cars, copyData(sampleCars)))
const customers = ref(loadData(STORAGE_KEYS.customers, copyData(sampleCustomers)))
const rentals = ref(loadData(STORAGE_KEYS.rentals, copyData(sampleRentals)))

watch(cars, (value) => saveData(STORAGE_KEYS.cars, value), { deep: true })
watch(customers, (value) => saveData(STORAGE_KEYS.customers, value), { deep: true })
watch(rentals, (value) => saveData(STORAGE_KEYS.rentals, value), { deep: true })

const activeRentals = computed(() => rentals.value.filter((rental) => rental.status === 'Active'))
const availableCars = computed(() => cars.value.filter((car) => car.status === 'Available'))

const stats = computed(() => ({
  totalCars: cars.value.length,
  availableCars: cars.value.filter((car) => car.status === 'Available').length,
  rentedCars: cars.value.filter((car) => car.status === 'Rented').length,
  totalReservations: rentals.value.length,
}))

function getCar(id) {
  return cars.value.find((car) => car.id === id)
}

function getCustomer(id) {
  return customers.value.find((customer) => customer.id === id)
}

function getRental(id) {
  return rentals.value.find((rental) => rental.id === id)
}

function daysBetween(startDate, returnDate) {
  if (!startDate || !returnDate) return 0

  const start = dateToTime(startDate)
  const end = dateToTime(returnDate)
  const dayLength = 1000 * 60 * 60 * 24
  return Math.ceil((end - start) / dayLength)
}

function calculateRentalTotal(carId, startDate, returnDate) {
  const car = getCar(carId)
  const days = daysBetween(startDate, returnDate)

  if (!car || days <= 0) return 0
  return Number(car.dailyPrice) * days
}

function validateCar(payload, editingId = null) {
  const requiredFields = [
    ['name', 'Car name is required.'],
    ['brand', 'Brand is required.'],
    ['model', 'Model is required.'],
    ['plateNumber', 'Plate number is required.'],
  ]

  for (const [field, message] of requiredFields) {
    if (!cleanText(payload[field])) return message
  }

  if (!payload.dailyPrice || Number(payload.dailyPrice) <= 0) {
    return 'Daily rental price must be greater than 0.'
  }

  const duplicatePlate = cars.value.some(
    (car) => car.id !== editingId && cleanPlate(car.plateNumber) === cleanPlate(payload.plateNumber),
  )

  if (duplicatePlate) return 'A car with this plate number already exists.'
  return ''
}

function addCar(payload) {
  const error = validateCar(payload)
  if (error) return { success: false, message: error }

  cars.value.push({
    id: createId('car'),
    name: cleanText(payload.name),
    brand: cleanText(payload.brand),
    model: cleanText(payload.model),
    plateNumber: cleanPlate(payload.plateNumber),
    dailyPrice: Number(payload.dailyPrice),
    status: payload.status || 'Available',
    imageUrl: cleanText(payload.imageUrl),
  })

  return { success: true, message: 'Car record saved successfully.' }
}

function updateCar(id, payload) {
  const car = getCar(id)
  if (!car) return { success: false, message: 'Car record was not found.' }

  const error = validateCar(payload, id)
  if (error) return { success: false, message: error }

  const hasActiveRental = activeRentals.value.some((rental) => rental.carId === id)
  if (hasActiveRental && payload.status === 'Available') {
    return { success: false, message: 'This car has an active rental and must stay rented.' }
  }

  Object.assign(car, {
    name: cleanText(payload.name),
    brand: cleanText(payload.brand),
    model: cleanText(payload.model),
    plateNumber: cleanPlate(payload.plateNumber),
    dailyPrice: Number(payload.dailyPrice),
    status: payload.status || 'Available',
    imageUrl: cleanText(payload.imageUrl),
  })

  return { success: true, message: 'Car record updated successfully.' }
}

function deleteCar(id) {
  const car = getCar(id)
  if (!car) return { success: false, message: 'Car record was not found.' }

  const hasActiveRental = activeRentals.value.some((rental) => rental.carId === id)
  if (hasActiveRental) {
    return { success: false, message: 'Complete the active rental before deleting this car.' }
  }

  cars.value = cars.value.filter((item) => item.id !== id)
  return { success: true, message: 'Car record deleted successfully.' }
}

function validateCustomer(payload) {
  const requiredFields = [
    ['name', 'Customer name is required.'],
    ['contactNumber', 'Contact number is required.'],
    ['email', 'Email address is required.'],
    ['address', 'Address is required.'],
  ]

  for (const [field, message] of requiredFields) {
    if (!cleanText(payload[field])) return message
  }

  if (!cleanText(payload.email).includes('@')) {
    return 'Please enter a valid email address.'
  }

  return ''
}

function addCustomer(payload) {
  const error = validateCustomer(payload)
  if (error) return { success: false, message: error }

  customers.value.push({
    id: createId('cust'),
    name: cleanText(payload.name),
    contactNumber: cleanText(payload.contactNumber),
    email: cleanText(payload.email),
    address: cleanText(payload.address),
  })

  return { success: true, message: 'Customer record saved successfully.' }
}

function updateCustomer(id, payload) {
  const customer = getCustomer(id)
  if (!customer) return { success: false, message: 'Customer record was not found.' }

  const error = validateCustomer(payload)
  if (error) return { success: false, message: error }

  Object.assign(customer, {
    name: cleanText(payload.name),
    contactNumber: cleanText(payload.contactNumber),
    email: cleanText(payload.email),
    address: cleanText(payload.address),
  })

  return { success: true, message: 'Customer record updated successfully.' }
}

function deleteCustomer(id) {
  const customer = getCustomer(id)
  if (!customer) return { success: false, message: 'Customer record was not found.' }

  const hasActiveRental = activeRentals.value.some((rental) => rental.customerId === id)
  if (hasActiveRental) {
    return { success: false, message: 'Complete the active rental before deleting this customer.' }
  }

  customers.value = customers.value.filter((item) => item.id !== id)
  return { success: true, message: 'Customer record deleted successfully.' }
}

function validateRental(payload, editingId = null) {
  const car = getCar(payload.carId)
  const customer = getCustomer(payload.customerId)

  if (!car) return 'Please select a car.'
  if (!customer) return 'Please select a customer.'
  if (!payload.startDate) return 'Start date is required.'
  if (!payload.returnDate) return 'Return date is required.'
  if (daysBetween(payload.startDate, payload.returnDate) <= 0) {
    return 'Return date must be later than the start date.'
  }

  const existingRental = editingId ? getRental(editingId) : null
  const isSameActiveRental = existingRental?.status === 'Active' && existingRental.carId === payload.carId

  if (car.status !== 'Available' && !isSameActiveRental) {
    return 'Only available cars can be rented.'
  }

  return ''
}

function addRental(payload) {
  const error = validateRental(payload)
  if (error) return { success: false, message: error }

  const car = getCar(payload.carId)
  const totalCost = calculateRentalTotal(payload.carId, payload.startDate, payload.returnDate)

  rentals.value.push({
    id: createId('rent'),
    carId: payload.carId,
    customerId: payload.customerId,
    startDate: payload.startDate,
    returnDate: payload.returnDate,
    totalCost,
    status: 'Active',
    createdAt: new Date().toISOString(),
  })

  car.status = 'Rented'
  return { success: true, message: 'Rental transaction created successfully.' }
}

function updateRental(id, payload) {
  const rental = getRental(id)
  if (!rental) return { success: false, message: 'Rental record was not found.' }
  if (rental.status === 'Completed') {
    return { success: false, message: 'Completed rentals are kept as history and cannot be edited.' }
  }

  const error = validateRental(payload, id)
  if (error) return { success: false, message: error }

  const oldCar = getCar(rental.carId)
  const newCar = getCar(payload.carId)

  if (oldCar && oldCar.id !== newCar.id) {
    oldCar.status = 'Available'
  }

  Object.assign(rental, {
    carId: payload.carId,
    customerId: payload.customerId,
    startDate: payload.startDate,
    returnDate: payload.returnDate,
    totalCost: calculateRentalTotal(payload.carId, payload.startDate, payload.returnDate),
  })

  newCar.status = 'Rented'
  return { success: true, message: 'Rental record updated successfully.' }
}

function completeRental(id) {
  const rental = getRental(id)
  if (!rental) return { success: false, message: 'Rental record was not found.' }
  if (rental.status === 'Completed') return { success: false, message: 'Rental is already completed.' }

  rental.status = 'Completed'
  const car = getCar(rental.carId)
  if (car) car.status = 'Available'

  return { success: true, message: 'Rental completed. The car is available again.' }
}

function deleteRental(id) {
  const rental = getRental(id)
  if (!rental) return { success: false, message: 'Rental record was not found.' }

  if (rental.status === 'Active') {
    const car = getCar(rental.carId)
    if (car) car.status = 'Available'
  }

  rentals.value = rentals.value.filter((item) => item.id !== id)
  return { success: true, message: 'Rental record deleted successfully.' }
}

export function useRentalStore() {
  return {
    cars,
    customers,
    rentals,
    activeRentals,
    availableCars,
    stats,
    getCar,
    getCustomer,
    getRental,
    calculateRentalTotal,
    daysBetween,
    addCar,
    updateCar,
    deleteCar,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addRental,
    updateRental,
    completeRental,
    deleteRental,
  }
}
