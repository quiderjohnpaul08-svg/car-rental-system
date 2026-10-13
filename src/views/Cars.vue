<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <h2>{{ editingId ? 'Edit Car' : 'Add New Car' }}</h2>
        <button v-if="editingId" class="btn btn-light" type="button" @click="resetForm">Cancel Edit</button>
      </div>

      <p v-if="notice.message" class="notice" :class="notice.type">{{ notice.message }}</p>

      <form class="form-grid" @submit.prevent="saveCar">
        <label>
          Car Name
          <input v-model="form.name" type="text" required placeholder="Toyota Vios" />
        </label>
        <label>
          Brand
          <input v-model="form.brand" type="text" required placeholder="Toyota" />
        </label>
        <label>
          Model
          <input v-model="form.model" type="text" required placeholder="Vios 1.3 E" />
        </label>
        <label>
          Plate Number
          <input v-model="form.plateNumber" type="text" required placeholder="ABC-1234" />
        </label>
        <label>
          Daily Rental Price
          <input v-model.number="form.dailyPrice" type="number" min="1" required placeholder="1800" />
        </label>
        <label>
          Status
          <select v-model="form.status" required>
            <option>Available</option>
            <option>Rented</option>
          </select>
        </label>
        <label class="full-field">
          Image URL
          <input v-model="form.imageUrl" type="url" placeholder="Optional image link" />
        </label>

        <div class="form-actions full-field">
          <button class="btn btn-primary" type="submit">{{ editingId ? 'Update Car' : 'Save Car' }}</button>
          <button class="btn btn-light" type="button" @click="resetForm">Clear</button>
        </div>
      </form>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Car List</h2>
        <span class="record-count">{{ store.cars.value.length }} records</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Car</th>
              <th>Brand</th>
              <th>Plate</th>
              <th>Daily Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="car in store.cars.value" :key="car.id">
              <td>
                <div class="car-cell">
                  <img v-if="car.imageUrl" :src="car.imageUrl" :alt="car.name" />
                  <span v-else class="image-fallback">Car</span>
                  <div>
                    <strong>{{ car.name }}</strong>
                    <small>{{ car.model }}</small>
                  </div>
                </div>
              </td>
              <td>{{ car.brand }}</td>
              <td>{{ car.plateNumber }}</td>
              <td>{{ money(car.dailyPrice) }}</td>
              <td>
                <span class="status-pill" :class="car.status === 'Available' ? 'status-available' : 'status-rented'">
                  {{ car.status }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-small btn-light" type="button" @click="selectCar(car)">View</button>
                  <button class="btn btn-small btn-secondary" type="button" @click="startEdit(car)">Edit</button>
                  <button class="btn btn-small btn-danger" type="button" @click="removeCar(car)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="store.cars.value.length === 0">
              <td colspan="6" class="empty-cell">No car records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="selectedCar" class="section details-section">
      <div class="section-header">
        <h2>Car Details</h2>
        <button class="btn btn-light" type="button" @click="selectedCarId = ''">Close</button>
      </div>
      <div class="details-grid">
        <img v-if="selectedCar.imageUrl" class="detail-image" :src="selectedCar.imageUrl" :alt="selectedCar.name" />
        <div class="detail-list">
          <p><strong>Name:</strong> {{ selectedCar.name }}</p>
          <p><strong>Brand:</strong> {{ selectedCar.brand }}</p>
          <p><strong>Model:</strong> {{ selectedCar.model }}</p>
          <p><strong>Plate Number:</strong> {{ selectedCar.plateNumber }}</p>
          <p><strong>Daily Price:</strong> {{ money(selectedCar.dailyPrice) }}</p>
          <p><strong>Status:</strong> {{ selectedCar.status }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRentalStore } from '../composables/useRentalStore'

const store = useRentalStore()
const editingId = ref('')
const selectedCarId = ref('')
const notice = reactive({ message: '', type: '' })

const form = reactive(getEmptyForm())

const selectedCar = computed(() => store.getCar(selectedCarId.value))

function getEmptyForm() {
  return {
    name: '',
    brand: '',
    model: '',
    plateNumber: '',
    dailyPrice: '',
    status: 'Available',
    imageUrl: '',
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

function saveCar() {
  const result = editingId.value ? store.updateCar(editingId.value, form) : store.addCar(form)
  setNotice(result)

  if (result.success) {
    resetForm()
  }
}

function startEdit(car) {
  Object.assign(form, car)
  editingId.value = car.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectCar(car) {
  selectedCarId.value = car.id
}

function removeCar(car) {
  if (!window.confirm(`Delete ${car.name}?`)) return
  const result = store.deleteCar(car.id)
  setNotice(result)
  if (selectedCarId.value === car.id && result.success) selectedCarId.value = ''
}

function money(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value || 0)
}
</script>
