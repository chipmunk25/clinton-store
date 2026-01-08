import { sql } from 'drizzle-orm';
import { db } from './index';

async function reset() {
  console.log('🗑️  Dropping all tables...');
  
  await db.execute(sql`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
  `);
  
  console.log('✅ Database reset complete');
  console.log('Run "pnpm db:push && pnpm db:seed" to recreate');
}

reset()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  });