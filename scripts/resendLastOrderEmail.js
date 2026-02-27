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
        <td><img src="${thumbnail}" alt="${name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"></td>
        <td>
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
    template = template.replace(/{{customerName}}/g, order.customer_full_name || 'Cliente');
    template = template.replace(/{{orderId}}/g, order.order_number || '');
    template = template.replace(/{{total}}/g, `$${formatPrice(order.grand_total)}`);
    template = template.replace(/{{year}}/g, new Date().getFullYear().toString());
    template = template.replace('{{ITEMS_HTML}}', itemsHtml);
    
    // Enviar email con Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('\n📧 Enviando email...');
    const result = await resend.emails.send({
      from: 'JB Skylens <onboarding@resend.dev>',
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
