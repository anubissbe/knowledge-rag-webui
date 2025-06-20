#!/usr/bin/env python3
import psycopg2
import os
import sys

# Database connection parameters
db_params = {
    'host': '192.168.1.24',
    'port': 5433,
    'database': 'mcp_learning',
    'user': 'app_user',
    'password': 'app_secure_2024'
}

task_id = 'aa8107b4-d116-4d82-90e9-9e3a9d3ab818'
new_status = 'in_progress'

try:
    # Connect to the database
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    
    # Update the task status
    update_query = """
        UPDATE tasks 
        SET status = %s, updated_at = NOW(), started_at = COALESCE(started_at, NOW())
        WHERE id = %s
        RETURNING id, name, status
    """
    
    cursor.execute(update_query, (new_status, task_id))
    result = cursor.fetchone()
    
    if result:
        print(f"Successfully updated task:")
        print(f"  ID: {result[0]}")
        print(f"  Name: {result[1]}")
        print(f"  Status: {result[2]}")
        conn.commit()
    else:
        print(f"Task with ID {task_id} not found")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error updating task: {e}")
    sys.exit(1)