// app/logs/page.js
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import styles from './logs.module.css';

export default function LogViewer() {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lines, setLines] = useState(100);
  const [clearingLogs, setClearingLogs] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(null);
  
  // Function to fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/logs?lines=${lines}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLogs(data.content);
      setError(null);
      
      // Reset clear success message after a successful fetch
      if (clearSuccess) {
        setTimeout(() => {
          setClearSuccess(null);
        }, 3000);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to clear logs
  const clearLogs = async () => {
    // Confirm with user before proceeding
    if (!window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      return;
    }
    
    try {
      setClearingLogs(true);
      setError(null);
      setClearSuccess(null);
      
      const response = await fetch('/api/logs', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear logs');
      }
      
      const result = await response.json();
      setClearSuccess(result.message || 'Logs cleared successfully');
      
      // Refresh logs to show they've been cleared
      fetchLogs();
    } catch (err) {
      setError(err.message);
      console.error('Error clearing logs:', err);
    } finally {
      setClearingLogs(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [lines]);
  
  // Setup auto-refresh if enabled
  useEffect(() => {
    let interval;
    
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, lines]);

  return (
    <div className={styles.container}>
      <h1>Application Logs</h1>
      
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="lines">Show last</label>
          <select 
            id="lines" 
            value={lines} 
            onChange={(e) => setLines(parseInt(e.target.value))}
            className={styles.select}
          >
            <option value={50}>50 lines</option>
            <option value={100}>100 lines</option>
            <option value={500}>500 lines</option>
            <option value={1000}>1000 lines</option>
            <option value={0}>All lines</option>
          </select>
        </div>
        
        <div className={styles.controlGroup}>
          <label htmlFor="autoRefresh">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
            />
            Auto-refresh (5s)
          </label>
        </div>
        
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className={styles.refreshButton}
        >
          {loading ? 'Loading...' : 'Refresh Logs'}
        </button>
        
        <button 
          onClick={clearLogs} 
          disabled={clearingLogs || loading}
          className={styles.clearButton}
        >
          {clearingLogs ? 'Clearing...' : 'Clear Logs'}
        </button>
      </div>
      
      {error && (
        <div className={styles.error}>
          <p>Error: {error}</p>
        </div>
      )}
      
      {clearSuccess && (
        <div className={styles.success}>
          <p>{clearSuccess}</p>
        </div>
      )}
      
      <div className={styles.logContainer}>
        {loading && !logs ? (
          <div className={styles.loading}>Loading logs...</div>
        ) : (
          <pre className={styles.logs}>{logs || 'No logs found.'}</pre>
        )}
      </div>
    </div>
  );
}