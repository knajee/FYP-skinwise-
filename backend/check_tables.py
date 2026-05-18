import asyncio
import aiomysql

async def check():
    conn = await aiomysql.connect(host='127.0.0.1', port=3306, user='root', password='naeem.32', db='skinwise')
    cur = await conn.cursor()
    await cur.execute('SHOW TABLES;')
    tables = await cur.fetchall()
    print("TABLES:", tables)
    conn.close()

asyncio.run(check())
