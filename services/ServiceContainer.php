<?php
// services/ServiceContainer.php - Lightweight dependency injection container

final class ServiceContainer {
    private array $services = [];
    private array $instances = [];
    private array $singletons = [];
    
    public function register(string $name, callable $factory): void {
        $this->services[$name] = $factory;
        $this->singletons[$name] = false;
    }
    
    public function singleton(string $name, callable $factory): void {
        $this->services[$name] = $factory;
        $this->singletons[$name] = true;
    }
    
    public function get(string $name): mixed {
        if (!$this->has($name)) {
            throw new \InvalidArgumentException("Service '{$name}' not found");
        }
        
        if ($this->singletons[$name] && isset($this->instances[$name])) {
            return $this->instances[$name];
        }
        
        $factory = $this->services[$name];
        $instance = $factory($this);
        
        if ($this->singletons[$name]) {
            $this->instances[$name] = $instance;
        }
        
        return $instance;
    }
    
    public function has(string $name): bool {
        return isset($this->services[$name]);
    }
    
    public function clearInstances(): void {
        $this->instances = [];
    }
}