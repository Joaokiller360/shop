import path from 'path';
import { registerJob } from '@evershop/evershop/lib/cronjob';
import { hookAfter } from '@evershop/evershop/lib/util/hookable';
import { emit } from '@evershop/evershop/lib/event';
import { pool } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/postgres-query-builder';
export default function() {
    // Registrar cronjob
    registerJob({
        name: 'sampleJob',
        schedule: '*/1 * * * *',
        resolve: path.resolve(import.meta.dirname, 'crons', 'everyMinute.js'),
        enabled: true
    });
    // Hook para emitir order_placed después de crear orden
    // Esto funciona para CUALQUIER método de pago
    hookAfter('createOrderFunc', async function customEmitOrderPlaced(orderResult) {
        console.log('🔥 hookAfter createOrderFunc - orderResult:', orderResult);
        try {
            // El resultado del insert solo tiene insertId, necesitamos cargar la orden completa
            const orderId = orderResult?.insertId;
            if (orderId) {
                // Cargar la orden completa de la base de datos
                const order = await select().from('order').where('order_id', '=', orderId).load(pool);
                if (order) {
                    console.log('🔥 Emitiendo order_placed para orden:', order.order_number);
                    await emit('order_placed', order);
                    console.log('✅ Evento order_placed emitido correctamente');
                }
            }
        } catch (err) {
            console.error('❌ Error emitiendo order_placed:', err.message);
        }
    });
}
