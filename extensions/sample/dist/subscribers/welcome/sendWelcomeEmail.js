import fs from 'fs';
import path from 'path';
import { getValue } from '@evershop/evershop/lib/util/registry';
import { getConfig } from '@evershop/evershop/lib/util/getConfig';
import { debug, error } from '@evershop/evershop/lib/log';
export default async function sendWelcomeEmail(eventData) {
    try {
        const user = eventData;
        debug('Custom welcome email triggered');
        // Leer la plantilla personalizada
        const templatePath = path.resolve(import.meta.dirname, '../../../../../themes/model/src/emails/Welcome.html');
        let template = fs.readFileSync(templatePath, 'utf8');
        // Reemplazar variables
        const customerName = user.full_name || user.fullName || user.first_name || user.firstName || 'Cliente';
        const customerEmail = user.email || '';
        template = template.replace(/{{customerName}}/g, customerName);
        template = template.replace(/{{year}}/g, new Date().getFullYear().toString());
        // Obtener el servicio de email
        const emailService = await getValue('emailService', {});
        const fromEmail = getConfig('system.notification_emails.from', 'noreply@tienda.com');
        if (emailService && emailService.sendEmail && customerEmail) {
            await emailService.sendEmail({
                to: customerEmail,
                from: fromEmail,
                subject: `¡Bienvenido a la tienda, ${customerName}!`,
                body: template
            });
            debug(`Custom welcome email sent to ${customerEmail}`);
        }
        else {
            error('Email service not available or customer email missing');
        }
    }
    catch (err) {
        error(`Error sending custom welcome email: ${err.message}`);
    }
}
//# sourceMappingURL=sendWelcomeEmail.js.map