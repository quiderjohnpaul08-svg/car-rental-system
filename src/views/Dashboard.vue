<template>
  <div class="page">
    <section class="stat-grid">
      <StatCard title="Total Cars" :value="store.stats.value.totalCars" note="Saved car records" accent="blue" />
      <StatCard
        title="Available Cars"
        :value="store.stats.value.availableCars"
        note="Ready for rental"
        accent="green"
      />
      <StatCard title="Rented Cars" :value="store.stats.value.rentedCars" note="Currently out" accent="amber" />
      <StatCard
        title="Reservations"
        :value="store.stats.value.totalReservations"
        note="Rental history"
        accent="red"
      />
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Recent Rentals</h2>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="rental in recentRentals" :key="rental.id">
              <td>{{ carName(rental.carId) }}</td>
              <td>{{ customerName(rental.customerId) }}</td>
              <td>{{ rental.startDate }} to {{ rental.returnDate }}</td>
              <td>{{ money(rental.totalCost) }}</td>
              <td>
                <span class="status-pill" :class="statusClass(rental.status)">{{ rental.status }}</span>
              </td>
            </tr>
            <tr v-if="recentRentals.length === 0">
              <td colspan="5" class="empty-cell">No rentals yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatCard from '../components/StatCard.vue'
import { useRentalStore } from '../composables/useRentalStore'

const store = useRentalStore()

const recentRentals = computed(() =>
  [...store.rentals.value]
    .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
    .slice(0, 5),
)

function carName(id) {
  const car = store.getCar(id)
  return car ? `${car.name} (${car.plateNumber})` : 'Deleted car'
}

function customerName(id) {
  const customer = store.getCustomer(id)
  return customer ? customer.name : 'Deleted customer'
}

function money(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function statusClass(status) {
  return status === 'Active' ? 'status-rented' : 'status-available'
}
</script>
