<script lang="ts">
  import * as Skeleton from '$lib/components/ui/skeleton/index.js';
  
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    showMessage?: boolean;
  }
  
  let { size = 'md', message = 'Loading...', showMessage = true }: Props = $props();
  
  const sizeClasses = {
    sm: 'h-4 w-16',
    md: 'h-6 w-24', 
    lg: 'h-8 w-32'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
</script>

<div class="flex flex-col items-center justify-center gap-4 p-8">
  <div class="flex flex-col items-center gap-2">
    <Skeleton.Skeleton class={sizeClasses[size]} />
    <Skeleton.Skeleton class="h-3 w-20" />
    <Skeleton.Skeleton class="h-3 w-16" />
  </div>
  
  {#if showMessage}
    <p class="text-muted-foreground text-center font-medium {textSizeClasses[size]}">{message}</p>
  {/if}
</div>