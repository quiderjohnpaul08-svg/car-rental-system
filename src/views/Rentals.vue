<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <h2>{{ editingId ? 'Edit Rental' : 'Create Rental' }}</h2>
        <button v-if="editingId" class="btn btn-light" type="button" @click="resetForm">Cancel Edit</button>
      </div>

      <p v-if="notice.message" class="notice" :class="notice.type">{{ notice.message }}</p>

      <form class="form-grid" @submit.prevent="saveRental">
        <label>
          Available Car
          <select v-model="form.carId" required>
            <option value="" disabled>Select car</option>
            <option v-for="car in carOptions" :key="car.id" :value="car.id">
              {{ car.name }} - {{ car.plateNumber }} ({{ money(car.dailyPrice) }}/day)
            </option>
          </select>
        </label>
        <label>
          Customer
          <select v-model="form.customerId" required>
            <option value="" disabled>Select customer</option>
            <option v-for="customer in store.customers.value" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </label>
        <label>
          Start Date
          <input v-model="form.startDate" type="date" required />
        </label>
        <label>
          Return Date
          <input v-model="form.returnDate" type="date" required />
        </label>

        <div class="total-box full-field">
          <span>Rental Duration</span>
          <strong>{{ duration }} day{{ duration === 1 ? '' : 's' }}</strong>
          <span>Total Cost</span>
          <strong>{{ money(totalPreview) }}</strong>
        </div>

        <div class="form-actions full-field">
          <button class="btn btn-primary" type="submit">
            {{ editingId ? 'Update Rental' : 'Create Rental' }}
          </button>
          <button class="btn btn-light" type="button" @click="resetForm">Clear</button>
        </div>
      </form>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Rental History</h2>
        <span class="record-count">{{ store.rentals.value.length }} records</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Car</th>
              <th>Customer</th>
              <th>Dates</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rental in store.rentals.value" :key="rental.id">
              <td>{{ carName(rental.carId) }}</td>
              <td>{{ customerName(rental.customerId) }}</td>
              <td>{{ rental.startDate }} to {{ rental.returnDate }}</td>
              <td>{{ money(rental.totalCost) }}</td>
              <td>
                <span class="status-pill" :class="statusClass(rental.status)">{{ rental.status }}</span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-small btn-light" type="button" @click="selectRental(rental)">View</button>
                  <button
                    class="btn btn-small btn-secondary"
                    type="button"
                    :disabled="rental.status === 'Completed'"
                    @click="startEdit(rental)"
                  >
                    Edit
                  </button>
                  <button
                    class="btn btn-small btn-success"
                    type="button"
                    :disabled="rental.status === 'Completed'"
                    @click="finishRental(rental)"
                  >
                    Complete
                  </button>
                  <button class="btn btn-small btn-danger" type="button" @click="removeRental(rental)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="store.rentals.value.length === 0">
              <td colspan="6" class="empty-cell">No rental records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="selectedRental" class="section details-section">
      <div class="section-header">
        <h2>Rental Details</h2>
        <button class="btn btn-light" type="button" @click="selectedRentalId = ''">Close</button>
      </div>
      <div class="detail-list">
        <p><strong>Car:</strong> {{ carName(selectedRental.carId) }}</p>
        <p><strong>Customer:</strong> {{ customerName(selectedRental.customerId) }}</p>
        <p><strong>Start Date:</strong> {{ selectedRental.startDate }}</p>
        <p><strong>Return Date:</strong> {{ selectedRental.returnDate }}</p>
        <p><strong>Total Cost:</strong> {{ money(selectedRental.totalCost) }}</p>
        <p><strong>Status:</strong> {{ selectedRental.status }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRentalStore } from '../composables/useRentalStore'

const store = useRentalStore()
const editingId = ref('')
const selectedRentalId = ref('')
const notice = reactive({ message: '', type: '' })
const form = reactive(getEmptyForm())

const selectedRental = computed(() => store.getRental(selectedRentalId.value))
const duration = computed(() => Math.max(0, store.daysBetween(form.startDate, form.returnDate)))
const totalPreview = computed(() => store.calculateRentalTotal(form.carId, form.startDate, form.returnDate))

const carOptions = computed(() => {
  if (!editingId.value) return store.availableCars.value

  return store.cars.value.filter((car) => car.status === 'Available' || car.id === form.carId)
})

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getTomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

function getEmptyForm() {
  return {
    carId: '',
    customerId: '',
    startDate: getToday(),
    returnDate: getTomorrow(),
  }
}

function setNotice(result) {
  notice.message = result.message
  notice.type = result.success ? 'success' : 'error'
}

function resetForm() {
  Object.assign(form, getEmptyForm())
  editingId.value = ''
}

function saveRental() {
  const result = editingId.value ? store.updateRental(editingId.value, form) : store.addRental(form)
  setNotice(result)

  if (result.success) {
    resetForm()
  }
}

function startEdit(rental) {
  Object.assign(form, {
    carId: rental.carId,
    customerId: rental.customerId,
    startDate: rental.startDate,
    returnDate: rental.returnDate,
  })
  editingId.value = rental.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectRental(rental) {
  selectedRentalId.value = rental.id
}

function finishRental(rental) {
  if (!window.confirm('Complete this rental transaction?')) return
  const result = store.completeRental(rental.id)
  setNotice(result)
}

function removeRental(rental) {
  if (!window.confirm('Delete this rental record?')) return
  const result = store.deleteRental(rental.id)
  setNotice(result)
  if (selectedRentalId.value === rental.id && result.success) selectedRentalId.value = ''
}

function carName(id) {
  const car = store.getCar(id)
  return car ? `${car.name} (${car.plateNumber})` : 'Deleted car'
}

function customerName(id) {
  const customer = store.getCustomer(id)
  return customer ? customer.name : 'Deleted customer'
}

function statusClass(status) {
  return status === 'Active' ? 'status-rented' : 'status-available'
}

function money(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value || 0)
}
</script>
