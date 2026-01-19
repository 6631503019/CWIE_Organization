<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-icon">🔍</div>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div class="not-found-actions">
        <a href="/" class="btn btn-primary">Go Home</a>
        <button onclick="history.back()" class="btn btn-secondary">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// RouterLink removed temporarily
</script>

<style scoped>
.not-found {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.not-found-icon {
  font-size: 5rem;
  margin-bottom: 24px;
}

.not-found h1 {
  font-size: 6rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 16px;
  line-height: 1;
}

.not-found h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.not-found p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
}

.not-found-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .not-found h1 {
    font-size: 4rem;
  }
  
  .not-found h2 {
    font-size: 1.5rem;
  }
  
  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>