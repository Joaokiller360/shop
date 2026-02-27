// Script para reenviar el email del último pedido
// Ejecutar con: node scripts/resendLastOrderEmail.js

import pg from 'pg';
import dotenv from 'dotenv';
import { Resend } from 'resend';

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

const SHOP_URL = process.env.SHOP_URL || 'https://shop.joaobarres.dev';

const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirmación de Pedido</title>
</head>
<body style="font-family: Arial, sans-serif; background:#1B4B2E; color:#222; margin:0; padding:0;">
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
  </div>

  <div style="background:#fff; padding:32px; margin:24px auto; border-radius:8px; max-width:600px; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
    {{SHIPPING_INFO}}
  </div>

  <div style="background:#fff; padding:32px; margin:24px auto; border-radius:8px; max-width:600px; box-shadow:0 2px 8px rgba(0,0,0,0.07);">
    <p style="text-align:center; color:#666;">
      Te avisaremos cuando tu pedido haya sido enviado.
    </p>

    <div style="margin-top:32px; font-size:13px; color:#888; text-align:center;">
      Si tienes dudas, responde a este correo.<br>
      &copy; {{year}} {{shopName}}.
    </div>
  </div>
</body>
</html>`;

async function resendLastOrderEmail() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    
    // Obtener el último pedido
    const orderResult = await pool.query(`
      SELECT * FROM "order" 
      ORDER BY order_id DESC 
      LIMIT 1
    `);
    
    if (orderResult.rows.length === 0) {
      console.log('❌ No hay pedidos en la base de datos');
      return;
    }
    
    const order = orderResult.rows[0];
    console.log('📦 Último pedido:', order.order_number);
    console.log('📧 Email del cliente:', order.customer_email);
    
    // Obtener la dirección de envío
    let shippingAddress = null;
    if (order.shipping_address_id) {
      const addressResult = await pool.query(`
        SELECT * FROM order_address 
        WHERE order_address_id = $1
      `, [order.shipping_address_id]);
      if (addressResult.rows.length > 0) {
        shippingAddress = addressResult.rows[0];
        console.log('📍 Dirección de envío:', JSON.stringify(shippingAddress));
      }
    }
    
    // Obtener los items del pedido
    const itemsResult = await pool.query(`
      SELECT * FROM order_item 
      WHERE order_item_order_id = $1
    `, [order.order_id]);
    
    const items = itemsResult.rows;
    console.log('📦 Items encontrados:', items.length);
    
    // Obtener las imágenes de los productos
    const productIds = items.map(item => item.product_id);
    let productImages = [];
    if (productIds.length > 0) {
      const imagesResult = await pool.query(`
        SELECT * FROM product_image 
        WHERE product_image_product_id = ANY($1)
      `, [productIds]);
      productImages = imagesResult.rows;
    }
    
    console.log('🖼️ Imágenes encontradas:', productImages.length);
    if (productImages.length > 0) {
      console.log('🖼️ Primera imagen:', JSON.stringify(productImages[0]));
    }
    
    // Crear mapa de imágenes
    const imageMap = {};
    productImages.forEach(img => {
      if (!imageMap[img.product_image_product_id] || img.is_main) {
        imageMap[img.product_image_product_id] = img.origin_image;
      }
    });
    console.log('🖼️ Image map:', JSON.stringify(imageMap));
    
    // Función para formatear precios
    const formatPrice = (price) => {
      const num = parseFloat(price) || 0;
      return num.toFixed(2);
    };
    
    // Construir HTML de items
    const itemsHtml = items.map(item => {
      let thumbnail = `${SHOP_URL}/placeholder.png`;
      
      const imageSrc = item.thumbnail || imageMap[item.product_id];
      console.log('📷 Image source for product', item.product_id, ':', imageSrc);
      
      if (imageSrc) {
        if (imageSrc.startsWith('http')) {
          thumbnail = imageSrc;
        } else {
          let imagePath = imageSrc;
          if (!imagePath.startsWith('/')) {
            imagePath = '/' + imagePath;
          }
          const fullPath = imagePath.startsWith('/assets') ? imagePath : `/assets${imagePath}`;
          const encodedPath = encodeURIComponent(fullPath);
          thumbnail = `${SHOP_URL}/images?src=${encodedPath}&w=80&q=75`;
        }
      }
      
      console.log('📷 Final thumbnail URL:', thumbnail);
      
      const name = item.product_name || 'Producto';
      const quantity = item.qty || 1;
      const priceInclTax = formatPrice(item.final_price_incl_tax || item.final_price || 0);
      const priceExclTax = formatPrice(item.final_price || 0);
      const taxAmount = formatPrice(item.tax_amount || 0);
      
      return `<tr>
        <td><img src="${thumbnail}" alt="${name}" style="width: 80px; height: 80px; object-fit: cover;"></td>
        <td style="padding-left:12px;">
          <div style="font-weight: 600; color: #333;">${name}</div>
        </td>
        <td style="text-align: center;">${quantity}</td>
        <td style="text-align: right;">$${priceExclTax}</td>
        <td style="text-align: right;">$${taxAmount}</td>
        <td style="text-align: right;">$${priceInclTax}</td>
      </tr>`;
    }).join('\n');
    
    // Construir template
    let template = EMAIL_TEMPLATE;
    const SHOP_NAME = process.env.SHOP_NAME || 'JB Skylens';
    const hasName = !!order.customer_full_name && order.customer_full_name.trim() !== '';
    const welcomeText = hasName
      ? `¡Gracias por tu compra, <br/>${order.customer_full_name}!`
      : '¡Gracias por tu compra!';
    template = template.replace(/{{customerName}}/g, order.customer_full_name || 'Cliente');
    template = template.replace(/{{welcomeClient}}/g, welcomeText);
    template = template.replace(/{{orderId}}/g, order.order_number || '');
    template = template.replace(/{{total}}/g, `$${formatPrice(order.grand_total)}`);
    template = template.replace(/{{year}}/g, new Date().getFullYear().toString());
    template = template.replace(/{{shopName}}/g, SHOP_NAME);
    template = template.replace('{{ITEMS_HTML}}', itemsHtml);
    
    // Construir HTML de datos de envío
    let shippingInfoHtml = '';
    if (shippingAddress || order.shipping_method_name) {
      shippingInfoHtml = `
        <div style="margin: 24px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <h3 style="color: #1B4B2E; margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            📦 Datos de envío
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${order.shipping_method_name ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Método de Envío:</strong> ${order.shipping_method_name}</li>` : ''}
            ${shippingAddress?.country ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>País:</strong> ${shippingAddress.country}</li>` : ''}
            ${shippingAddress?.province ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Provincia:</strong> ${shippingAddress.province}</li>` : ''}
            ${shippingAddress?.city ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ciudad:</strong> ${shippingAddress.city}</li>` : ''}
            ${shippingAddress?.address_1 ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Dirección:</strong> ${shippingAddress.address_1}${shippingAddress.address_2 ? ', ' + shippingAddress.address_2 : ''}</li>` : ''}
            ${shippingAddress?.postcode ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Código Postal:</strong> ${shippingAddress.postcode}</li>` : ''}
            ${shippingAddress?.telephone ? `<li style="padding: 8px 0;"><strong>Teléfono:</strong> ${shippingAddress.telephone}</li>` : ''}
          </ul>
        </div>
      `;
    } else if (order.no_shipping_required) {
      shippingInfoHtml = `
        <div style="margin: 24px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
          <p style="color: #666; margin: 0;">📍 Este pedido no requiere envío físico</p>
        </div>
      `;
    }
    template = template.replace('{{SHIPPING_INFO}}', shippingInfoHtml);
    
    // Enviar email con Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('\n📧 Enviando email...');
    const result = await resend.emails.send({
      from: 'JB Skylens <pedidos@joaobarres.dev>',
      to: order.customer_email,
      subject: `Confirmación de pedido #${order.order_number}`,
      html: template
    });
    
    console.log('✅ Email enviado:', result);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
}

resendLastOrderEmail();
