import asyncio
import aiomysql

async def test_conn():
    print("Connecting...")
    conn = await aiomysql.connect(host='127.0.0.1', port=3306, user='root', password='naeem.32', db='skinwise')
    print("Connected!")
    await conn.close()

asyncio.run(test_conn())
