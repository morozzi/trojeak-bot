<?php
// database.php - Database operations with PHP 8.3 features

readonly class QueryResult {
    public function __construct(
        public bool $success,
        public int $affectedRows = 0,
        public int $insertId = 0,
        public ?string $error = null
    ) {}
}

class Database {
    private \mysqli $conn;
    
    public function __construct(
        private readonly ErrorLogService $errorLogService
    ) {
        try {
            $this->conn = new \mysqli(
                DatabaseConfig::HOST, 
                DatabaseConfig::USER, 
                DatabaseConfig::PASS, 
                DatabaseConfig::NAME
            );
            
            if ($this->conn->connect_error) {
                $this->errorLogService->log('data', 'connection_failed', 
                    ErrorContext::create(null, null, 'CONNECTION'), [$this->conn->connect_error]);
                throw new \RuntimeException($this->errorLogService->getMessage(
                    'data', 'connection_failed', [$this->conn->connect_error]
                ));
            }
            
            $this->conn->set_charset("utf8mb4");
            $this->conn->query("SET `time_zone` = '" . date('P') . "'");
            
        } catch (\Exception $e) {
            $this->errorLogService->log('data', 'connection_failed', 
                ErrorContext::create(null, null, 'CONNECTION_INIT'), [$e->getMessage()]);
            throw new \RuntimeException($this->errorLogService->getMessage(
                'data', 'connection_failed', [$e->getMessage()]
            ));
        }
    }
    
    public function rawQuery(string $sql): bool {
        try {
            $result = $this->conn->query($sql);
            return $result !== false;
        } catch (\Exception $e) {
            $this->errorLogService->log('data', 'query_failed', 
                ErrorContext::create(null, null, 'RAW_QUERY'), [$e->getMessage(), $sql]);
            return false;
        }
    }
    
    public function getLastInsertId(): int {
        return $this->conn->insert_id;
    }
    
    public function clearCache(?string $pattern = null): void {
        if ($pattern === null) {
            $iterator = new APCUIterator('#^' . preg_quote(CacheKeys::DB_CACHE_PREFIX) . '#');
            foreach ($iterator as $item) {
                apcu_delete($item['key']);
            }
        } else {
            $patternHash = md5($pattern);
            $iterator = new APCUIterator('#^' . preg_quote(CacheKeys::DB_CACHE_PREFIX) . $patternHash . '#');
            foreach ($iterator as $item) {
                apcu_delete($item['key']);
            }
        }
    }
    
    public function selectRow(string $table, array $conditions = [], array $columns = ['*'], ?int $ttl = null): ?array {
        $sql = $this->buildSelectQuery($table, $conditions, $columns, 1);
        [$types, $params] = $this->prepareParams($conditions);
        
        $cacheKey = null;
        if ($ttl !== null) {
            $cacheKey = CacheKeys::DB_CACHE_PREFIX . md5($sql . json_encode($params));
            $cachedValue = apcu_fetch($cacheKey, $success);
            if ($success) {
                return $cachedValue;
            }
        }
        
        try {
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                $this->errorLogService->log('data', 'prepare_failed', 
                    ErrorContext::create(null, null, 'SELECT_ROW'), [$this->conn->error, $sql]);
                return null;
            }
            
            if (!empty($params)) $stmt->bind_param($types, ...$params);
            if (!$stmt->execute()) {
                $stmt->close();
                return null;
            }
            
            $result = $stmt->get_result();
            $row = ($result && $result->num_rows > 0) ? $result->fetch_assoc() : null;
            $stmt->close();
            
            if ($ttl !== null && $cacheKey !== null && $row !== null) {
                apcu_store($cacheKey, $row, $ttl);
            }
            
            return $row;
        } catch (\Exception $e) {
            $this->errorLogService->log('data', 'query_failed', 
                ErrorContext::create(null, null, 'SELECT_ROW'), [$e->getMessage(), $sql]);
            return null;
        }
    }
    
    public function selectRows(
        string $table, 
        array $conditions = [], 
        array $columns = ['*'], 
        ?int $limit = null, 
        ?string $orderBy = null, 
        string $orderDirection = 'ASC', 
        ?int $ttl = null
    ): array {
        $sql = $this->buildSelectQuery($table, $conditions, $columns, $limit, $orderBy, $orderDirection);
        [$types, $params] = $this->prepareParams($conditions);
        
        $cacheKey = null;
        if ($ttl !== null) {
            $cacheKey = CacheKeys::DB_CACHE_PREFIX . md5($sql . json_encode($params));
            $cachedValue = apcu_fetch($cacheKey, $success);
            if ($success) {
                return $cachedValue;
            }
        }
        
        try {
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                $this->errorLogService->log('data', 'prepare_failed', 
                    ErrorContext::create(null, null, 'SELECT_ROWS'), [$this->conn->error, $sql]);
                return [];
            }
            
            if (!empty($params)) $stmt->bind_param($types, ...$params);
            if (!$stmt->execute()) {
                $stmt->close();
                return [];
            }
            
            $result = $stmt->get_result();
            $rows = [];
            
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $rows[] = $row;
                }
            }
            
            $stmt->close();
            
            if ($ttl !== null && $cacheKey !== null) {
                apcu_store($cacheKey, $rows, APCuConfig::LONG_TTL);
            }
            
            return $rows;
        } catch (\Exception $e) {
            $this->errorLogService->log('data', 'query_failed', 
                ErrorContext::create(null, null, 'SELECT_ROWS'), [$e->getMessage(), $sql]);
            return [];
        }
    }
    
    public function insert(string $table, array $data, ?string $cachePattern = null): QueryResult {
        try {
            $columns = array_keys($data);
            $placeholders = array_fill(0, count($columns), '?');
            
            $sql = "INSERT INTO `{$table}` (`" . implode('`, `', $columns) . "`) 
                   VALUES (" . implode(', ', $placeholders) . ")";
            
            [$types, $params] = $this->prepareParams($data);
            
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                $this->errorLogService->log('data', 'prepare_failed', 
                    ErrorContext::create(null, null, 'INSERT'), [$this->conn->error, $sql]);
                return new QueryResult(success: false, error: $this->conn->error);
            }
            
            if (!empty($params)) $stmt->bind_param($types, ...$params);
            if (!$stmt->execute()) {
                $error = $stmt->error;
                $stmt->close();
                return new QueryResult(success: false, error: $error);
            }
            
            $stmt->close();
            
            if ($cachePattern) $this->clearCache($cachePattern);
            
            return new QueryResult(
                success: true,
                affectedRows: $this->conn->affected_rows,
                insertId: $this->getLastInsertId()
            );
        } catch (\Exception $e) {
            $this->errorLogService->log('data', 'query_failed', 
                ErrorContext::create(null, null, 'INSERT'), [$e->getMessage(), $sql]);
            return new QueryResult(success: false, error: $e->getMessage());
        }
    }
    
    public function update(string $table, array $data, array $conditions, ?string $cachePattern = null): QueryResult {
        try {
            $set = array_map(fn($col) => "`{$col}` = ?", array_keys($data));
            $where = array_map(fn($col) => "`{$col}` = ?", array_keys($conditions));
            
            $sql = "UPDATE `{$table}` SET " . implode(', ', $set);
            if (!empty($where)) $sql .= " WHERE " . implode(' AND ', $where);
            
            $allParams = array_merge(array_values($data), array_values($conditions));
            $types = '';
            foreach ($allParams as $param) $types .= $this->getParamType($param);
            
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                $this->errorLogService->log('data', 'prepare_failed', 
                    ErrorContext::create(null, null, 'UPDATE'), [$this->conn->error, $sql]);
                return new QueryResult(success: false, error: $this->conn->error);
            }
            
            if (!empty($allParams)) $stmt->bind_param($types, ...$allParams);
            if (!$stmt->execute()) {
                $error = $stmt->error;
                $stmt->close();
                return new QueryResult(success: false, error: $error);
            }
            
            $stmt->close();
            
            if ($cachePattern) $this->clearCache($cachePattern);
            
            return new QueryResult(
                success: true,
                affectedRows: $this->conn->affected_rows
            );
        } catch (\Exception $e) {
            $this->errorLogService->log('data', 'query_failed', 
                ErrorContext::create(null, null, 'UPDATE'), [$e->getMessage(), $sql]);
            return new QueryResult(success: false, error: $e->getMessage());
        }
    }
    
    public function delete(string $table, array $conditions, ?string $cachePattern = null): QueryResult {
        try {
            if (empty($conditions)) {
                throw new \InvalidArgumentException("Delete requires conditions");
            }
            
            $where = array_map(fn($col) => "`{$col}` = ?", array_keys($conditions));
            $sql = "DELETE FROM `{$table}` WHERE " . implode(' AND ', $where);
            
            [$types, $params] = $this->prepareParams($conditions);
            
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                $this->errorLogService->log('data', 'prepare_failed', 
                    ErrorContext::create(null, null, 'DELETE'), [$this->conn->error, $sql]);
                return new QueryResult(success: false, error: $this->conn->error);
            }
            
            if (!empty($params)) $stmt->bind_param($types, ...$params);
            if (!$stmt->execute()) {
                $error = $stmt->error;
                $stmt->close();
                return new QueryResult(success: false, error: $error);
            }
            
            $stmt->close();
            
            if ($cachePattern) $this->clearCache($cachePattern);
            
            return new QueryResult(
                success: true,
                affectedRows: $this->conn->affected_rows
            );
        } catch (\Exception $e) {
            $this->errorLogService->log('data', 'query_failed', 
                ErrorContext::create(null, null, 'DELETE'), [$e->getMessage(), $sql]);
            return new QueryResult(success: false, error: $e->getMessage());
        }
    }
    
    public function count(string $table, array $conditions = [], ?int $ttl = null): int {
        $row = $this->selectRow($table, $conditions, ['COUNT(*) as count'], $ttl);
        return $row ? (int)($row['count'] ?? 0) : 0;
    }
    
    public function exists(string $table, array $conditions, ?int $ttl = null): bool {
        return $this->count($table, $conditions, $ttl) > 0;
    }
    
    public function transaction(callable $callback): mixed {
        try {
            $this->conn->query("START TRANSACTION");
            $result = $callback($this);
            $this->conn->query("COMMIT");
            return $result;
        } catch (\Exception $e) {
            try {
                $this->conn->query("ROLLBACK");
            } catch (\Exception $rollbackException) {
                $this->errorLogService->log('data', 'transaction_failed', 
                    ErrorContext::create(null, null, 'ROLLBACK'), [$rollbackException->getMessage()]);
            }
            
            $this->errorLogService->log('data', 'transaction_failed', 
                ErrorContext::create(null, null, 'TRANSACTION'), [$e->getMessage()]);
            return false;
        }
    }
    
    public function close(): void {
        $this->conn->close();
    }
    
    public function __destruct() {
        $this->close();
    }
    
    private function buildSelectQuery(
        string $table, 
        array $conditions, 
        array $columns = ['*'], 
        ?int $limit = null, 
        ?string $orderBy = null, 
        string $orderDirection = 'ASC'
    ): string {
        $sql = "SELECT " . implode(', ', $columns) . " FROM {$table}";
        
        if (!empty($conditions)) {
            $whereConditions = [];
            
            foreach ($conditions as $col => $value) {
                $escapedCol = ($dotPos = strrpos($col, '.')) !== false ? 
                    substr($col, 0, $dotPos) . '.`' . substr($col, $dotPos + 1) . '`' : 
                    "`{$col}`";
                
                if (is_array($value) && count($value) == 2 && $value[0] === 'IN') {
                    $inValues = $value[1];
                    if (is_array($inValues) && !empty($inValues)) {
                        $placeholders = str_repeat('?,', count($inValues));
                        $placeholders = rtrim($placeholders, ',');
                        $whereConditions[] = "{$escapedCol} IN ({$placeholders})";
                    } else {
                        $whereConditions[] = "1=0";
                    }
                } elseif (is_array($value) && count($value) == 2) {
                    list($operator, $operand) = $value;
                    $whereConditions[] = "{$escapedCol} {$operator} ?";
                } else {
                    $whereConditions[] = "{$escapedCol} = ?";
                }
            }
            
            $sql .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        if ($orderBy) {
            $dir = strtoupper($orderDirection) === 'DESC' ? 'DESC' : 'ASC';
            $sql .= " ORDER BY {$orderBy} {$dir}";
        }
        
        if ($limit && $limit > 0) $sql .= " LIMIT {$limit}";
        
        return $sql;
    }
    
    private function prepareParams(array $params): array {
        $types = '';
        $values = [];
        
        foreach ($params as $col => $param) {
            if (is_array($param) && count($param) == 2 && $param[0] === 'IN') {
                $inValues = $param[1];
                if (is_array($inValues) && !empty($inValues)) {
                    foreach ($inValues as $inValue) {
                        $types .= $this->getParamType($inValue);
                        $values[] = $inValue;
                    }
                }
            } elseif (is_array($param) && count($param) == 2) {
                $types .= $this->getParamType($param[1]);
                $values[] = $param[1];
            } else {
                $types .= $this->getParamType($param);
                $values[] = $param;
            }
        }
        
        return [$types, $values];
    }
    
    private function getParamType(mixed $param): string {
        return match(true) {
            is_int($param) => 'i',
            is_float($param) => 'd',
            is_bool($param) => 'i',
            is_resource($param) => 'b',
            default => 's'
        };
    }
}