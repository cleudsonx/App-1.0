package db;

import java.sql.*;
import java.util.*;
import java.util.concurrent.*;

/**
 * Connection Pool Manager para PostgreSQL
 * Gerencia conexões com thread-safety e auto-reconnect
 */
public class ConnectionPool {
    private static ConnectionPool instance;
    private final BlockingQueue<Connection> availableConnections;
    private final Set<Connection> allConnections;
    private final String url;
    private final String username;
    private final String password;
    private final int poolSize;
    private volatile boolean closed = false;

    private ConnectionPool(String url, String username, String password, int poolSize) throws SQLException {
        this.url = url;
        this.username = username;
        this.password = password;
        this.poolSize = poolSize;
        this.availableConnections = new LinkedBlockingQueue<>(poolSize);
        this.allConnections = Collections.synchronizedSet(new HashSet<>());
        
        initializePool();
    }

    /**
     * Inicializa o pool com conexões
     */
    private void initializePool() throws SQLException {
        for (int i = 0; i < poolSize; i++) {
            try {
                Connection conn = createConnection();
                availableConnections.offer(conn);
                allConnections.add(conn);
            } catch (SQLException e) {
                System.err.println("[DB] Erro ao criar conexão #" + (i + 1) + ": " + e.getMessage());
                throw e;
            }
        }
        System.out.println("[DB] Pool inicializado com " + poolSize + " conexões");
    }

    /**
     * Cria uma nova conexão PostgreSQL
     */
    private Connection createConnection() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("PostgreSQL Driver não encontrado. Adicione postgresql-*.jar ao classpath");
        }
        return DriverManager.getConnection(url, username, password);
    }

    /**
     * Obtém instância singleton do pool
     */
    public static synchronized ConnectionPool getInstance(String url, String username, String password) throws SQLException {
        if (instance == null) {
            instance = new ConnectionPool(url, username, password, 10);
        }
        return instance;
    }

    /**
     * Obtém instância singleton do pool (reusa config anterior)
     */
    public static synchronized ConnectionPool getInstance() throws SQLException {
        if (instance == null) {
            throw new SQLException("ConnectionPool não foi inicializado. Chame getInstance(url, user, pass) primeiro");
        }
        return instance;
    }

    /**
     * Retorna uma conexão disponível do pool
     */
    public Connection getConnection() throws SQLException {
        if (closed) {
            throw new SQLException("ConnectionPool foi fechado");
        }
        
        try {
            Connection conn = availableConnections.poll(5, TimeUnit.SECONDS);
            if (conn == null) {
                throw new SQLException("Timeout ao aguardar conexão do pool (5s)");
            }
            
            // Verifica se conexão ainda é válida
            if (!isConnectionValid(conn)) {
                try {
                    conn.close();
                } catch (SQLException ignored) {}
                allConnections.remove(conn);
                conn = createConnection();
                allConnections.add(conn);
            }
            
            return conn;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SQLException("Interrompido ao aguardar conexão: " + e.getMessage());
        }
    }

    /**
     * Retorna conexão ao pool
     */
    public void returnConnection(Connection conn) {
        if (conn != null && !closed) {
            availableConnections.offer(conn);
        }
    }

    /**
     * Verifica se conexão está válida
     */
    private boolean isConnectionValid(Connection conn) {
        try {
            return !conn.isClosed() && conn.isValid(2);
        } catch (SQLException e) {
            return false;
        }
    }

    /**
     * Fecha o pool (chamar no shutdown da aplicação)
     */
    public synchronized void close() {
        closed = true;
        for (Connection conn : allConnections) {
            try {
                conn.close();
            } catch (SQLException e) {
                System.err.println("[DB] Erro ao fechar conexão: " + e.getMessage());
            }
        }
        allConnections.clear();
        availableConnections.clear();
        System.out.println("[DB] Pool fechado");
    }

    /**
     * Executa query SELECT com auto-retry
     */
    public <T> T executeQuery(String sql, ResultSetHandler<T> handler) throws SQLException {
        Connection conn = getConnection();
        try {
            Statement stmt = conn.createStatement();
            try {
                ResultSet rs = stmt.executeQuery(sql);
                try {
                    return handler.handle(rs);
                } finally {
                    rs.close();
                }
            } finally {
                stmt.close();
            }
        } finally {
            returnConnection(conn);
        }
    }

    /**
     * Executa query com parâmetros
     */
    public <T> T executeQuery(String sql, Object[] params, ResultSetHandler<T> handler) throws SQLException {
        Connection conn = getConnection();
        try {
            PreparedStatement pstmt = conn.prepareStatement(sql);
            try {
                for (int i = 0; i < params.length; i++) {
                    pstmt.setObject(i + 1, params[i]);
                }
                ResultSet rs = pstmt.executeQuery();
                try {
                    return handler.handle(rs);
                } finally {
                    rs.close();
                }
            } finally {
                pstmt.close();
            }
        } finally {
            returnConnection(conn);
        }
    }

    /**
     * Executa INSERT/UPDATE/DELETE
     */
    public int executeUpdate(String sql, Object... params) throws SQLException {
        Connection conn = getConnection();
        try {
            PreparedStatement pstmt = conn.prepareStatement(sql);
            try {
                for (int i = 0; i < params.length; i++) {
                    pstmt.setObject(i + 1, params[i]);
                }
                return pstmt.executeUpdate();
            } finally {
                pstmt.close();
            }
        } finally {
            returnConnection(conn);
        }
    }

    /**
     * Executa INSERT com auto-generated keys
     */
    public long executeInsertReturnId(String sql, Object... params) throws SQLException {
        Connection conn = getConnection();
        try {
            PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            try {
                for (int i = 0; i < params.length; i++) {
                    pstmt.setObject(i + 1, params[i]);
                }
                pstmt.executeUpdate();
                
                ResultSet rs = pstmt.getGeneratedKeys();
                try {
                    if (rs.next()) {
                        return rs.getLong(1);
                    }
                    throw new SQLException("Erro ao obter generated key");
                } finally {
                    rs.close();
                }
            } finally {
                pstmt.close();
            }
        } finally {
            returnConnection(conn);
        }
    }

    /**
     * Interface para handlers de ResultSet
     */
    @FunctionalInterface
    public interface ResultSetHandler<T> {
        T handle(ResultSet rs) throws SQLException;
    }

    /**
     * Retorna status do pool
     */
    public String getStatus() {
        return String.format("[DB] Pool Status: Available=%d, Total=%d, Closed=%s", 
            availableConnections.size(), allConnections.size(), closed);
    }
}
