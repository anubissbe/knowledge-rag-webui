#!/usr/bin/env python3
import psycopg2

# Database connection parameters
db_params = {
    'host': '192.168.1.24',
    'port': 5433,
    'database': 'mcp_learning',
    'user': 'app_user',
    'password': 'app_secure_2024'
}

try:
    # Connect to the database
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    print("Tables in database:")
    for table in tables:
        print(f"  - {table[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")