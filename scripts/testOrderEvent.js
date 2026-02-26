// Script para probar el evento order_placed
// Ejecutar con: node scripts/testOrderEvent.js

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function testEvents() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    
    // Ver eventos recientes
    const events = await pool.query(`
      SELECT * FROM event 
      ORDER BY event_id DESC 
      LIMIT 10
    `);
    
    console.log('\n📋 EVENTOS RECIENTES:');
    if (events.rows.length === 0) {
      console.log('   No hay eventos en la tabla.');
      console.log('   ⚠️  Esto significa que el evento order_placed NO se está emitiendo.');
    } else {
      events.rows.forEach(event => {
        console.log(`   - ${event.name} (ID: ${event.event_id})`);
        console.log(`     Data: ${JSON.stringify(event.data).substring(0, 100)}...`);
      });
    }

    // Ver órdenes recientes
    const orders = await pool.query(`
      SELECT order_id, order_number, customer_email, payment_method, grand_total, created_at 
      FROM "order" 
      ORDER BY order_id DESC 
      LIMIT 5
    `);
    
    console.log('\n📦 ÓRDENES RECIENTES:');
    orders.rows.forEach(order => {
      console.log(`   - #${order.order_number} | ${order.customer_email} | ${order.payment_method} | $${order.grand_total}`);
    });

    // Verificar método de pago
    if (orders.rows.length > 0) {
      const paymentMethod = orders.rows[0].payment_method;
      console.log(`\n💳 MÉTODO DE PAGO USADO: ${paymentMethod}`);
      
      if (paymentMethod === 'cod') {
        console.log('   ✅ COD debería emitir order_placed automáticamente');
      } else if (paymentMethod === 'paypal') {
        console.log('   ⚠️  PayPal emite order_placed al regresar de PayPal');
      } else if (paymentMethod === 'stripe') {
        console.log('   ⚠️  Stripe emite order_placed vía webhook');
      } else {
        console.log('   ⚠️  Método de pago no reconocido - puede que NO emita order_placed');
      }
    }

    // Emitir un evento de prueba
    console.log('\n🧪 EMITIENDO EVENTO DE PRUEBA...');
    await pool.query(`
      INSERT INTO event (name, data, uuid) 
      VALUES ('test_event', '{"test": true}', 'test-' || gen_random_uuid()::text)
    `);
    console.log('   ✅ Evento de prueba insertado');

    // Ver si hay subscribers cargados mirando logs
    console.log('\n📝 INFORMACIÓN:');
    console.log('   Los subscribers se ejecutan en un proceso separado.');
    console.log('   Revisa los logs del servidor para ver:');
    console.log('   - 🔥🔥🔥 CUSTOM ORDER CONFIRMATION EMAIL');
    console.log('   - o errores relacionados');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

testEvents();
