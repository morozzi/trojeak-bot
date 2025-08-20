<!-- miniapp/src/lib/components/LoadingAnimation.svelte -->
<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let message: string = 'Loading...';
  export let showMessage: boolean = true;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
</script>

<div class="loading-container">
  <!-- Neon Loading Spinner -->
  <div class="loading-spinner-wrapper">
    <div class="loading-spinner {sizeClasses[size]}"></div>
    <div class="loading-pulse-ring {sizeClasses[size]}"></div>
  </div>
  
  {#if showMessage}
    <p class="loading-message {textSizeClasses[size]}">{message}</p>
  {/if}
</div>