import fs from 'fs';
import path from 'path';
import { getValue } from '@evershop/evershop/lib/util/registry';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { debug, error } from '@evershop/evershop/lib/log';
import { pool } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/postgres-query-builder';
import { getBaseUrl } from '@evershop/evershop/lib/util/getBaseUrl';

export default async function sendOrderConfirmation(eventData) {
  console.log('🔥🔥🔥 CUSTOM ORDER CONFIRMATION EMAIL TRIGGERED 🔥🔥🔥');
  console.log('Event data:', JSON.stringify(eventData, null, 2));
  
  try {
    // Obtener el order_id del evento
    const orderId = eventData.order_id;
    
    // Obtener la orden completa de la base de datos
    const order = await select()
      .from('order')
      .where('order_id', '=', orderId)
      .load(pool);
    
    if (!order) {
      error('Order not found');
      return;
    }

    // Obtener los items de la orden
    const items = await select()
      .from('order_item')
      .where('order_item_order_id', '=', orderId)
      .execute(pool);

    // Obtener la URL base para las imágenes
    const baseUrl = getBaseUrl();

    debug('Custom order confirmation email triggered');

    // Leer la plantilla personalizada - usar process.cwd() para compatibilidad con producción
    const templatePath = path.resolve(process.cwd(), 'themes/model/src/emails/OrderConfirmation.html');
    console.log('📧 Template path:', templatePath);
    
    if (!fs.existsSync(templatePath)) {
      console.error('❌ Template not found at:', templatePath);
      error('Template not found');
      return;
    }
    
    let template = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar variables
    const customerName = order.customer_full_name || 'Cliente';
    const orderNumber = order.order_number || '';
    const grandTotal = order.grand_total || '';
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
      
      // Precios
      const priceInclTax = item.final_price_incl_tax || item.final_price || '0';
      const priceExclTax = item.final_price || '0';
      const taxAmount = item.tax_amount || '0';
      
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
    
    template = template.replace(/{{#each items}}[\s\S]*?{{\/each}}/, itemsHtml || '<tr><td colspan="4">Ver detalles en tu cuenta</td></tr>');

    // Obtener el servicio de email
    const emailService = await getValue('emailService', {});
    const fromEmail = getConfig('system.notification_emails.from', 'noreply@tienda.com');

    if (emailService && emailService.sendEmail && customerEmail) {
      await emailService.sendEmail({
        to: customerEmail,
        from: fromEmail,
        subject: `Confirmación de pedido #${orderNumber}`,
        body: template
      });
      console.log(`✅ Custom order confirmation email sent to ${customerEmail}`);
    } else {
      error('Email service not available or customer email missing');
    }
  } catch (err) {
    console.error(`❌ Error sending custom order confirmation email: ${err.message}`);
    error(`Error sending custom order confirmation email: ${err.message}`);
  }
}
