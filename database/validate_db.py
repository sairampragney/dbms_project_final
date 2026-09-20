import re
import sys

def validate_sql_file(filepath):
    print(f"--- Validating SQL File: {filepath} ---")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Failed to read {filepath}: {e}")
        return False

    errors = []

    # Simple syntax / structure checks
    if "schema.sql" in filepath:
        required_tables = [
            "users", "disaster_alerts", "incidents", "emergency_requests",
            "safe_locations", "volunteers", "response_records"
        ]
        for table in required_tables:
            pattern = re.compile(rf"CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?{table}\b", re.IGNORECASE)
            if not pattern.search(content):
                errors.append(f"Missing CREATE TABLE definition for '{table}'")

        required_constraints = [
            "FOREIGN KEY", "PRIMARY KEY", "CHECK", "ENUM", "AUTO_INCREMENT"
        ]
        for constraint in required_constraints:
            if constraint not in content.upper():
                errors.append(f"Missing required constraint/keyword '{constraint}'")

        # Check for views and triggers
        if "CREATE OR REPLACE VIEW" not in content.upper() and "CREATE VIEW" not in content.upper():
            errors.append("Missing CREATE VIEW definition")

        if "CREATE TRIGGER" not in content.upper():
            errors.append("Missing CREATE TRIGGER definition")

    elif "seed.sql" in filepath:
        required_inserts = [
            "INSERT INTO users", "INSERT INTO disaster_alerts", "INSERT INTO incidents",
            "INSERT INTO emergency_requests", "INSERT INTO safe_locations",
            "INSERT INTO volunteers", "INSERT INTO response_records"
        ]
        for insert_stmt in required_inserts:
            if insert_stmt.upper() not in content.upper():
                errors.append(f"Missing seed data insert statement '{insert_stmt}'")

    if errors:
        for err in errors:
            print(f"❌ Syntax/Structural Error: {err}")
        return False
    else:
        print(f"✅ {filepath} passed structural and syntax verification.")
        return True

def main():
    print("Executing Database Validation & Verification Tool...\n")
    schema_valid = validate_sql_file("database/schema.sql")
    seed_valid = validate_sql_file("database/seed.sql")

    if schema_valid and seed_valid:
        print("\n🎉 All database validation checks passed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Database validation failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
