// Este archivo sobrescribe el subscriber original de Evershop
// para usar nuestra plantilla personalizada
import { getValue } from '@evershop/evershop/lib/util/registry';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { pool } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/postgres-query-builder';
import { getBaseUrl } from '@evershop/evershop/lib/util/getBaseUrl';
// Plantilla embebida para evitar problemas de rutas en producción
const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirmación de Pedido</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f7f7f7; color: #222; margin: 0; padding: 0; }
    .container { background: #fff; padding: 32px; margin: 24px auto; border-radius: 8px; max-width: 600px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
    h1 { color: #2d7aee; }
    h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .order-details { margin: 24px 0; }
    .footer { margin-top: 32px; font-size: 13px; color: #888; text-align: center; }
    .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .products-table th { background: #2d7aee; color: #fff; padding: 12px; text-align: left; }
    .products-table td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
    .products-table tr:hover { background: #f9f9f9; }
    .total-row { background: #f5f5f5; font-weight: bold; }
    .total-row td { padding: 16px 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>¡Gracias por tu compra, {{customerName}}!</h1>
    <p>Hemos recibido tu pedido <strong>#{{orderId}}</strong> y lo estamos procesando.</p>
    
    <div class="order-details">
      <h2>Productos del pedido</h2>
      <table class="products-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Impuesto</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {{ITEMS_HTML}}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="5" style="text-align: right;">Total:</td>
            <td>{{total}}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <p style="text-align: center; color: #666;">Te avisaremos cuando tu pedido haya sido enviado.</p>
    
    <div class="footer">
      Si tienes dudas, responde a este correo.<br>
      &copy; {{year}} Tu Tienda.
    </div>
  </div>
</body>
</html>`;
export default async function sendOrderConfirmationEmail(eventData) {
    console.log('🔥🔥🔥 CUSTOM ORDER CONFIRMATION EMAIL (OVERRIDE) 🔥🔥🔥');
    try {
        // Obtener el order_id del evento
        const orderId = eventData.order_id;
        console.log('📧 Processing order_id:', orderId);
        // Obtener la orden completa de la base de datos
        const order = await select()
            .from('order')
            .where('order_id', '=', orderId)
            .load(pool);
        if (!order) {
            console.error('❌ Order not found:', orderId);
            return;
        }
        console.log('📧 Order found:', order.order_number);
        // Obtener los items de la orden
        const items = await select()
            .from('order_item')
            .where('order_item_order_id', '=', orderId)
            .execute(pool);
        console.log('📧 Items found:', items.length);
        // Obtener la URL base para las imágenes
        const baseUrl = getBaseUrl();
        // Usar plantilla embebida
        let template = EMAIL_TEMPLATE;
        // Función para formatear precios con 2 decimales
        const formatPrice = (price) => {
            const num = parseFloat(price) || 0;
            return num.toFixed(2);
        };
        // Reemplazar variables
        const customerName = order.customer_full_name || 'Cliente';
        const orderNumber = order.order_number || '';
        const grandTotal = formatPrice(order.grand_total);
        const customerEmail = order.customer_email || '';
        template = template.replace(/{{customerName}}/g, customerName);
        template = template.replace(/{{orderId}}/g, orderNumber);
        template = template.replace(/{{total}}/g, `$${grandTotal}`);
        template = template.replace(/{{year}}/g, new Date().getFullYear().toString());
        // Render items con imagen, nombre, descripción, cantidad y precios
        const itemsHtml = items.map(item => {
            // Construir URL de la imagen
            let thumbnail = 'https://via.placeholder.com/80x80?text=Producto';
            if (item.product_thumbnail) {
                thumbnail = item.product_thumbnail.startsWith('http')
                    ? item.product_thumbnail
                    : `${baseUrl}${item.product_thumbnail}`;
            }
            const name = item.product_name || 'Producto';
            const description = item.product_custom_options
                ? JSON.parse(item.product_custom_options).map(opt => `${opt.option_name}: ${opt.value_text}`).join(', ')
                : '';
            const quantity = item.qty || 1;
            // Precios (formateados con 2 decimales)
            const priceInclTax = formatPrice(item.final_price_incl_tax || item.final_price || 0);
            const priceExclTax = formatPrice(item.final_price || 0);
            const taxAmount = formatPrice(item.tax_amount || 0);
            return `<tr>
        <td><img src="${thumbnail}" alt="${name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"></td>
        <td>
          <div style="font-weight: 600; color: #333;">${name}</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">${description}</div>
        </td>
        <td style="text-align: center;">${quantity}</td>
        <td style="text-align: right;">$${priceExclTax}</td>
        <td style="text-align: right;">$${taxAmount}</td>
        <td style="text-align: right;">$${priceInclTax}</td>
      </tr>`;
        }).join('\n');
        template = template.replace('{{ITEMS_HTML}}', itemsHtml || '<tr><td colspan="6">Ver detalles en tu cuenta</td></tr>');
        // Obtener el servicio de email
        const emailService = await getValue('emailService', {});
        const fromEmail = getConfig('system.notification_emails.from', 'noreply@tienda.com');
        console.log('📧 Email service available:', !!(emailService === null || emailService === void 0 ? void 0 : emailService.sendEmail));
        console.log('📧 Customer email:', customerEmail);
        console.log('📧 From email:', fromEmail);
        if (emailService && emailService.sendEmail && customerEmail) {
            const result = await emailService.sendEmail({
                to: customerEmail,
                from: fromEmail,
                subject: `Confirmación de pedido #${orderNumber}`,
                body: template
            });
            console.log(`✅ Custom order confirmation email sent to ${customerEmail}`, result);
        }
        else {
            console.error('❌ Email service not available or customer email missing');
            console.error('   emailService:', !!emailService);
            console.error('   sendEmail:', !!(emailService === null || emailService === void 0 ? void 0 : emailService.sendEmail));
            console.error('   customerEmail:', customerEmail);
        }
    }
    catch (err) {
        console.error(`❌ Error sending custom order confirmation email: ${err.message}`);
        console.error(err.stack);
    }
}
//# sourceMappingURL=sendOrderConfirmationEmail.js.map