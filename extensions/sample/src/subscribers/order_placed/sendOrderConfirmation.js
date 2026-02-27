import fs from 'fs';
import path from 'path';
import { getValue } from '@evershop/evershop/lib/util/registry';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { debug, error } from '@evershop/evershop/lib/log';
import { pool } from '@evershop/evershop/lib/postgres';
import { select } from '@evershop/postgres-query-builder';
import { getBaseUrl } from '@evershop/evershop/lib/util/getBaseUrl';

// Plantilla embebida para evitar problemas de rutas en producción
const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirmación de Pedido</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f7f7f7; color:#222; margin:0; padding:0;">
<div style="background:#fff; padding:32px; margin:24px auto; border-radius:8px; max-width:600px; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
  <!-- Header centrado -->
  <div style="text-align:center; padding:30px 0;">
    <img src="https://res.cloudinary.com/dzlavqhid/image/upload/v1768936317/logo.png"
         width="100"
         height="100"
         style="display:block; margin:0 auto; border-radius:50%;" />
    
    <h1 style="color:#1B4B2E; margin-top:15px;">
      {{welcomeClient}}
    </h1>
  </div>
  </div>

  <!-- Contenedor -->
  <div style="background:#fff; padding:32px; margin:24px auto; border-radius:8px; max-width:600px; box-shadow:0 2px 8px rgba(0,0,0,0.07);">

    <p style="color:#1B4B2E; font-size: 1.5rem">Hemos recibido tu pedido <strong>#{{orderId}}</strong> y lo estamos procesando.</p>

    <div style="margin:24px 0;">
      <h2 style="color:#333; border-bottom:2px solid #eee; padding-bottom:10px;">
        Productos del pedido
      </h2>

      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <thead>
          <tr>
            <th style="background:#1B4B2E; color:#fff; padding:12px; text-align:left;">Imagen</th>
            <th style="background:#1B4B2E; color:#fff; padding:12px; text-align:left;">Producto</th>
            <th style="background:#1B4B2E; color:#fff; padding:12px; text-align:left;">Cantidad</th>
            <th style="background:#1B4B2E; color:#fff; padding:12px; text-align:left;">Precio</th>
            <th style="background:#1B4B2E; color:#fff; padding:12px; text-align:left;">Impuesto</th>
            <th style="background:#1B4B2E; color:#fff; padding:12px; text-align:left;">Total</th>
          </tr>
        </thead>

        <tbody>
          {{ITEMS_HTML}}
        </tbody>

        <tfoot>
          <tr style="background:#f5f5f5; font-weight:bold;">
            <td colspan="5" style="padding:16px 12px; text-align:right;">Total:</td>
            <td style="padding:16px 12px;">{{total}}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p style="text-align:center; color:#666;">
      Te avisaremos cuando tu pedido haya sido enviado.
    </p>

    <div style="margin-top:32px; font-size:13px; color:#888; text-align:center;">
      Si tienes dudas, responde a este correo.<br>
      &copy; {{year}} Tu Tienda.
    </div>

  </div>
</body>
</html>`;

export default async function sendOrderConfirmation(eventData) {
  console.log('🔥🔥🔥 CUSTOM ORDER CONFIRMATION EMAIL TRIGGERED 🔥🔥🔥');
  
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
    
    // Obtener las imágenes de los productos (query separada)
    const productIds = items.map(item => item.product_id);
    let productImages = [];
    if (productIds.length > 0) {
      productImages = await select()
        .from('product_image')
        .where('product_image_product_id', 'IN', productIds)
        .execute(pool);
    }
    
    // Crear un mapa de product_id -> imagen
    const imageMap = {};
    productImages.forEach(img => {
      // Preferir la imagen marcada como main, o la primera disponible
      // El campo es origin_image (no image)
      if (!imageMap[img.product_image_product_id] || img.is_main) {
        imageMap[img.product_image_product_id] = img.origin_image;
      }
    });
    
    // Debug: ver las imágenes encontradas
    console.log('📧 Product IDs:', productIds);
    console.log('📧 Product images found:', productImages.length);
    if (productImages.length > 0) {
      console.log('📧 First image object:', JSON.stringify(productImages[0]));
    }
    console.log('📧 Image map:', JSON.stringify(imageMap));
    
    // Debug: ver todos los campos del primer item
    if (items.length > 0) {
      console.log('📧 First item keys:', Object.keys(items[0]));
      console.log('📧 First item thumbnail:', items[0].thumbnail);
    }

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
    const welcomeClient = order.customer_full_name ? `¡Gracias por tu compra, <br/>${order.customer_full_name}!` : '¡Gracias por tu compra!';
    const customerName = order.customer_full_name || '';
    const orderNumber = order.order_number || '';
    const grandTotal = formatPrice(order.grand_total);
    const customerEmail = order.customer_email || '';

    const SHOP_URL = process.env.SHOP_URL || 'http://shop.joaobarres.dev';

    const hasName = !!order.customer_full_name && order.customer_full_name.trim() !== '';
    const welcomeText = hasName
      ? `¡Gracias por tu compra, <br/>${order.customer_full_name}!`
      : '¡Gracias por tu compra!';
    
    template = template.replace(/{{customerName}}/g, order.customer_full_name || 'Cliente');
    template = template.replace(/{{welcomeClient}}/g, welcomeText);
    template = template.replace(/{{orderId}}/g, order.order_number || '');
    template = template.replace(/{{total}}/g, `$${formatPrice(order.grand_total)}`);
    template = template.replace(/{{year}}/g, new Date().getFullYear().toString());

    // Render items con imagen, nombre, descripción, cantidad y precios
    const itemsHtml = items.map(item => {
      // Construir URL de la imagen usando el endpoint /images de Next.js
      // Intentar obtener la imagen de: thumbnail (order_item), imageMap, o placeholder
      let thumbnail = `${SHOP_URL}/placeholder.png`; // Imagen por defecto
      
      // Buscar la imagen: primero en order_item.thumbnail, luego en el mapa de imágenes
      const imageSrc = item.thumbnail || imageMap[item.product_id];
      console.log('📷 Image source for product', item.product_id, ':', imageSrc); // Debug
      
      if (imageSrc) {
        if (imageSrc.startsWith('http')) {
          thumbnail = imageSrc;
        } else {
          // La imagen de product_image ya tiene /assets como prefijo
          // Solo necesitamos codificar la ruta para el endpoint /images
          let imagePath = imageSrc;
          if (!imagePath.startsWith('/')) {
            imagePath = '/' + imagePath;
          }
          // Si ya tiene /assets, usarlo directamente; si no, agregarlo
          const fullPath = imagePath.startsWith('/assets') ? imagePath : `/assets${imagePath}`;
          const encodedPath = encodeURIComponent(fullPath);
          thumbnail = `${SHOP_URL}/images?src=${encodedPath}&w=80&q=75`;
        }
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
    
    console.log('📧 Email service available:', !!emailService?.sendEmail);
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
    } else {
      console.error('❌ Email service not available or customer email missing');
      console.error('   emailService:', !!emailService);
      console.error('   sendEmail:', !!emailService?.sendEmail);
      console.error('   customerEmail:', customerEmail);
    }
  } catch (err) {
    console.error(`❌ Error sending custom order confirmation email: ${err.message}`);
    console.error(err.stack);
  }
}
