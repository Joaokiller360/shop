import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configura tu email aquí
const TO_EMAIL = 'joao1.joao3@gmail.com'; // ⬅️ CAMBIA ESTO por tu email real
const FROM_EMAIL = 'JB Skylens <onboarding@resend.dev>';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendTestEmail() {
  if (!RESEND_API_KEY) {
    console.error('❌ Error: RESEND_API_KEY no está configurado');
    //console.log('Ejecuta: export RESEND_API_KEY="re_GTBSE59U_MbqZvPV993mWASCsG1yQou2D"');
    process.exit(1);
  }

  // Leer la plantilla
  const templatePath = path.resolve(__dirname, '../themes/model/src/emails/OrderConfirmation.html');
  let template = fs.readFileSync(templatePath, 'utf8');

  // Datos de prueba con imágenes
  const testOrder = {
    customerName: 'Juan Pérez',
    orderId: 'TEST-12345',
    total: '$99.99',
    year: new Date().getFullYear(),
    items: [
      { 
        name: 'Lentes de Sol Premium', 
        description: 'Color: Negro | Material: Titanio',
        thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop',
        quantity: 1, 
        price: '49.99' 
      },
      { 
        name: 'Estuche Protector', 
        description: 'Estuche rígido para lentes',
        thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop',
        quantity: 2, 
        price: '25.00' 
      }
    ]
  };

  // Reemplazar variables
  template = template.replace(/{{customerName}}/g, testOrder.customerName);
  template = template.replace(/{{orderId}}/g, testOrder.orderId);
  template = template.replace(/{{total}}/g, testOrder.total);
  template = template.replace(/{{year}}/g, testOrder.year.toString());

  // Render items con tabla de imágenes
  const itemsHtml = testOrder.items.map(item => `<tr>
    <td><img src="${item.thumbnail}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"></td>
    <td>
      <div style="font-weight: 600; color: #333;">${item.name}</div>
      <div style="font-size: 12px; color: #666; margin-top: 4px;">${item.description}</div>
    </td>
    <td>${item.quantity}</td>
    <td>$${item.price}</td>
  </tr>`).join('\n');
  template = template.replace(/{{#each items}}[\s\S]*?{{\/each}}/, itemsHtml);

  // Enviar email
  const resend = new Resend(RESEND_API_KEY);
  
  console.log('📧 Enviando email de prueba...');
  console.log(`   To: ${TO_EMAIL}`);
  console.log(`   From: ${FROM_EMAIL}`);
  
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Confirmación de pedido #${testOrder.orderId} (PRUEBA)`,
      html: template
    });
    
    console.log('✅ Email enviado exitosamente!');
    console.log('   ID:', result.data?.id);
  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
  }
}

sendTestEmail();
