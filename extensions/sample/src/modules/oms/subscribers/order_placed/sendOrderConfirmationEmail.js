// Este archivo sobrescribe el subscriber original de Evershop
// para deshabilitar el email de confirmación del sistema.
// El email personalizado se envía desde extensions/sample/src/subscribers/order_placed/sendOrderConfirmation.js

export default async function sendOrderConfirmationEmail(data) {
  // No hacer nada - el email original está deshabilitado
  console.log('📧 Original order confirmation email DISABLED - using custom template');
}
