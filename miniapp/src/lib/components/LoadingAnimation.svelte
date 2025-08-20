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

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-8);
  }
  
  .loading-spinner-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .loading-spinner {
    border: 2px solid transparent;
    border-top: 2px solid var(--neon-cyan);
    border-right: 2px solid var(--neon-pink);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    position: relative;
    z-index: 2;
  }
  
  .loading-pulse-ring {
    position: absolute;
    border: 2px solid var(--neon-purple);
    border-radius: 50%;
    opacity: 0.3;
    animation: pulseRing 2s ease-in-out infinite;
  }
  
  .loading-message {
    color: var(--text-secondary);
    text-align: center;
    animation: fadeInOut 2s ease-in-out infinite;
    font-weight: 500;
  }
  
  /* Size-specific styles */
  .w-6 { width: 1.5rem; height: 1.5rem; }
  .h-6 { width: 1.5rem; height: 1.5rem; }
  .w-10 { width: 2.5rem; height: 2.5rem; }
  .h-10 { width: 2.5rem; height: 2.5rem; }
  .w-16 { width: 4rem; height: 4rem; }
  .h-16 { width: 4rem; height: 4rem; }
  
  .text-sm { font-size: var(--text-sm); }
  .text-base { font-size: var(--text-base); }
  .text-lg { font-size: var(--text-lg); }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulseRing {
    0% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes fadeInOut {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .loading-container {
      padding: var(--space-6);
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .loading-spinner,
    .loading-pulse-ring,
    .loading-message {
      animation: none;
    }
    
    .loading-spinner {
      border-top: 2px solid var(--neon-cyan);
      border-right: 2px solid var(--neon-cyan);
    }
  }
</style>