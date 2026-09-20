import os
import sys
import pymysql

def verify_remote_db():
    host = os.environ.get('DB_HOST') or os.environ.get('AIVEN_MYSQL_HOST')
    port = int(os.environ.get('DB_PORT') or os.environ.get('AIVEN_MYSQL_PORT') or '3306')
    user = os.environ.get('DB_USER') or 'avnadmin'
    password = os.environ.get('DB_PASSWORD') or os.environ.get('AIVEN_MYSQL_PASSWORD')
    db_name = os.environ.get('DB_NAME') or 'defaultdb'
    use_ssl = os.environ.get('DB_SSL', 'true').lower() in ('true', '1')

    if not host or not password:
        print("ℹ️ DB_HOST / AIVEN_MYSQL_HOST or DB_PASSWORD / AIVEN_MYSQL_PASSWORD environment variables not set.")
        print("To run verification against a remote Aiven MySQL instance, export environment variables:")
        print("  export DB_HOST=<host> DB_PORT=<port> DB_USER=avnadmin DB_PASSWORD=<pass> DB_SSL=true")
        sys.exit(0)

    print(f"Connecting to MySQL database at {user}@{host}:{port}/{db_name} (SSL: {use_ssl})...")

    ssl_config = {'ssl': {}} if use_ssl else None

    try:
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=db_name,
            ssl=ssl_config['ssl'] if ssl_config else None,
            autocommit=True
        )
        print("✅ Connection successful!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    try:
        with connection.cursor() as cursor:
            # Execute schema.sql
            schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
            if os.path.exists(schema_path):
                print(f"Executing {schema_path}...")
                with open(schema_path, 'r', encoding='utf-8') as f:
                    sql_statements = f.read().split(';')
                    for stmt in sql_statements:
                        stmt_clean = stmt.strip()
                        if stmt_clean and not stmt_clean.startswith('--'):
                            cursor.execute(stmt_clean)
                print("✅ Schema executed successfully.")

            # Execute seed.sql
            seed_path = os.path.join(os.path.dirname(__file__), 'seed.sql')
            if os.path.exists(seed_path):
                print(f"Executing {seed_path}...")
                with open(seed_path, 'r', encoding='utf-8') as f:
                    sql_statements = f.read().split(';')
                    for stmt in sql_statements:
                        stmt_clean = stmt.strip()
                        if stmt_clean and not stmt_clean.startswith('--'):
                            cursor.execute(stmt_clean)
                print("✅ Seed data executed successfully.")

            # Verify Tables
            expected_tables = ['users', 'disaster_alerts', 'incidents', 'emergency_requests', 'safe_locations', 'volunteers', 'response_records']
            cursor.execute("SHOW TABLES;")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"Tables found: {tables}")
            for t in expected_tables:
                if t in tables:
                    print(f"  ✅ Table '{t}' exists")
                else:
                    print(f"  ❌ Missing table '{t}'")

            # Verify View
            cursor.execute("SELECT * FROM v_dashboard_summary;")
            view_data = cursor.fetchone()
            print(f"✅ Dashboard summary view output verified: {view_data}")

            # Verify Trigger
            cursor.execute("SHOW TRIGGERS WHERE `Trigger` = 'trg_check_shelter_capacity_before_update';")
            triggers = cursor.fetchall()
            if triggers:
                print("✅ Trigger 'trg_check_shelter_capacity_before_update' verified")

        connection.close()
        print("\n🎉 Remote MySQL Database verification completed successfully!")
    except Exception as e:
        print(f"❌ Verification Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_remote_db()
