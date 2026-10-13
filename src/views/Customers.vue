<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <h2>{{ editingId ? 'Edit Customer' : 'Add New Customer' }}</h2>
        <button v-if="editingId" class="btn btn-light" type="button" @click="resetForm">Cancel Edit</button>
      </div>

      <p v-if="notice.message" class="notice" :class="notice.type">{{ notice.message }}</p>

      <form class="form-grid" @submit.prevent="saveCustomer">
        <label>
          Customer Name
          <input v-model="form.name" type="text" required placeholder="Maria Santos" />
        </label>
        <label>
          Contact Number
          <input v-model="form.contactNumber" type="text" required placeholder="0917-555-0123" />
        </label>
        <label>
          Email
          <input v-model="form.email" type="email" required placeholder="customer@example.com" />
        </label>
        <label>
          Address
          <input v-model="form.address" type="text" required placeholder="City or full address" />
        </label>

        <div class="form-actions full-field">
          <button class="btn btn-primary" type="submit">
            {{ editingId ? 'Update Customer' : 'Save Customer' }}
          </button>
          <button class="btn btn-light" type="button" @click="resetForm">Clear</button>
        </div>
      </form>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Customer List</h2>
        <span class="record-count">{{ store.customers.value.length }} records</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in store.customers.value" :key="customer.id">
              <td><strong>{{ customer.name }}</strong></td>
              <td>{{ customer.contactNumber }}</td>
              <td>{{ customer.email }}</td>
              <td>{{ customer.address }}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-small btn-light" type="button" @click="selectCustomer(customer)">View</button>
                  <button class="btn btn-small btn-secondary" type="button" @click="startEdit(customer)">Edit</button>
                  <button class="btn btn-small btn-danger" type="button" @click="removeCustomer(customer)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="store.customers.value.length === 0">
              <td colspan="5" class="empty-cell">No customer records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="selectedCustomer" class="section details-section">
      <div class="section-header">
        <h2>Customer Details</h2>
        <button class="btn btn-light" type="button" @click="selectedCustomerId = ''">Close</button>
      </div>
      <div class="detail-list">
        <p><strong>Name:</strong> {{ selectedCustomer.name }}</p>
        <p><strong>Contact Number:</strong> {{ selectedCustomer.contactNumber }}</p>
        <p><strong>Email:</strong> {{ selectedCustomer.email }}</p>
        <p><strong>Address:</strong> {{ selectedCustomer.address }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRentalStore } from '../composables/useRentalStore'

const store = useRentalStore()
const editingId = ref('')
const selectedCustomerId = ref('')
const notice = reactive({ message: '', type: '' })
const form = reactive(getEmptyForm())

const selectedCustomer = computed(() => store.getCustomer(selectedCustomerId.value))

function getEmptyForm() {
  return {
    name: '',
    contactNumber: '',
    email: '',
    address: '',
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

function saveCustomer() {
  const result = editingId.value ? store.updateCustomer(editingId.value, form) : store.addCustomer(form)
  setNotice(result)

  if (result.success) {
    resetForm()
  }
}

function startEdit(customer) {
  Object.assign(form, customer)
  editingId.value = customer.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectCustomer(customer) {
  selectedCustomerId.value = customer.id
}

function removeCustomer(customer) {
  if (!window.confirm(`Delete ${customer.name}?`)) return
  const result = store.deleteCustomer(customer.id)
  setNotice(result)
  if (selectedCustomerId.value === customer.id && result.success) selectedCustomerId.value = ''
}
</script>
