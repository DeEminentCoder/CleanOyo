
import { generateSmsContent, generateEmailContent } from './geminiService';

export interface Notification {
  id: string;
  type: string;
  recipient: string;
  message: string;
  timestamp: Date;
  medium: 'SMS' | 'EMAIL';
}

class NotificationService {
  private observers: ((n: Notification) => void)[] = [];

  subscribe(callback: (n: Notification) => void) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  async sendSms(type: 'REMINDER' | 'STATUS_UPDATE' | 'CONFIRMATION', phone: string, data: any) {
    console.log(`[SMS Gateway] Preparing ${type} for ${phone}...`);
    
    const message = await generateSmsContent(type, data);
    
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      recipient: phone,
      message,
      timestamp: new Date(),
      medium: 'SMS'
    };

    setTimeout(() => {
      console.log(`%c[SMS SENT to ${phone}]: ${message}`, 'color: #10b981; font-weight: bold;');
      this.observers.forEach(obs => obs(notification));
    }, 1500);

    return notification;
  }

  async sendEmail(type: 'PASSWORD_RESET' | 'PICKUP_CONFIRMATION', email: string, data: any) {
    console.log(`[Email Gateway] Preparing ${type} for ${email}...`);
    
    const message = await generateEmailContent(type, data);
    
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      recipient: email,
      message,
      timestamp: new Date(),
      medium: 'EMAIL'
    };

    setTimeout(() => {
      console.log(`%c[EMAIL SENT to ${email}]: ${message}`, 'color: #3b82f6; font-weight: bold;');
      this.observers.forEach(obs => obs(notification));
    }, 1500);

    return notification;
  }
}

export const notificationService = new NotificationService();
