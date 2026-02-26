import fs from 'fs';
import path from 'path';
import { getValue } from '@evershop/evershop/lib/util/registry';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { debug, error } from '@evershop/evershop/lib/log';

export default async function sendOrderConfirmation(eventData) {
  console.log('🔥🔥🔥 CUSTOM ORDER CONFIRMATION EMAIL TRIGGERED 🔥🔥🔥');
  console.log('Event data:', JSON.stringify(eventData, null, 2));
  
  try {
    const order = eventData;
    
    debug('Custom order confirmation email triggered');

    // Leer la plantilla personalizada
    const templatePath = path.resolve(import.meta.dirname, '../../../../../themes/model/src/emails/OrderConfirmation.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar variables
    const customerName = order.customer_full_name || order.customerFullName || 'Cliente';
    const orderId = order.order_number || order.orderNumber || order.uuid || '';
    const grandTotal = order.grand_total || order.grandTotal || '';
    const customerEmail = order.customer_email || order.customerEmail || '';

    template = template.replace(/{{customerName}}/g, customerName);
    template = template.replace(/{{orderId}}/g, orderId);
    template = template.replace(/{{total}}/g, `$${grandTotal}`);
    template = template.replace(/{{year}}/g, new Date().getFullYear().toString());

    // Render items
    const items = order.items || [];
    const itemsHtml = items.map(item =>
      `<li>${item.product_name || item.productName || 'Producto'} x ${item.qty || item.quantity || 1} - $${item.final_price || item.finalPrice || ''}</li>`
    ).join('\n');
    template = template.replace(/{{#each items}}[\s\S]*?{{\/each}}/, itemsHtml || '<li>Ver detalles en tu cuenta</li>');

    // Obtener el servicio de email
    const emailService = await getValue('emailService', {});
    const fromEmail = getConfig('system.notification_emails.from', 'noreply@tienda.com');

    if (emailService && emailService.sendEmail && customerEmail) {
      await emailService.sendEmail({
        to: customerEmail,
        from: fromEmail,
        subject: `Confirmación de pedido #${orderId}`,
        body: template
      });
      debug(`Custom order confirmation email sent to ${customerEmail}`);
    } else {
      error('Email service not available or customer email missing');
    }
  } catch (err) {
    error(`Error sending custom order confirmation email: ${err.message}`);
  }
}
