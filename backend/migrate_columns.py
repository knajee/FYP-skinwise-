import asyncio
import aiomysql

async def migrate():
    conn = await aiomysql.connect(
        host='127.0.0.1', port=3306,
        user='root', password='naeem.32',
        db='skinwise'
    )
    cur = await conn.cursor()

    migrations = [
        ("lesion_detections", "class_id", "ALTER TABLE lesion_detections ADD COLUMN class_id INT NOT NULL DEFAULT 0 AFTER checkin_id"),
        ("checkins", "image_url", "ALTER TABLE checkins ADD COLUMN image_url VARCHAR(1024) NULL AFTER severity_grade"),
    ]

    for table, column, sql in migrations:
        await cur.execute(
            f"SELECT COUNT(*) FROM information_schema.COLUMNS "
            f"WHERE TABLE_SCHEMA='skinwise' AND TABLE_NAME='{table}' AND COLUMN_NAME='{column}'"
        )
        (count,) = await cur.fetchone()
        if count == 0:
            print(f"Adding column {table}.{column}...")
            await cur.execute(sql)
            await conn.commit()
            print(f"  Added {table}.{column}")
        else:
            print(f"  Column {table}.{column} already exists, skipping.")

    conn.close()
    print("Migration complete!")

asyncio.run(migrate())
