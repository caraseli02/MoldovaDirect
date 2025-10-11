// =============================================
// ORDER EMAIL UTILITIES TESTS
// =============================================
// Unit tests for order email utilities
// Requirements: 1.1, 4.1, 4.2

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { OrderWithItems } from '~/types/database'
import type { EmailLog } from '~/types/email'

// Mock the dependencies
vi.mock('~/server/utils/email', () => ({
  sendEmail: vi.fn(),
  generateOrderConfirmationEmailHtml: vi.fn()
}))

vi.mock('~/server/utils/emailLogging', () => ({
  createEmailLog: vi.fn(),
  updateEmailLog: vi.fn(),
  recordEmailAttempt: vi.fn(),
  getEmailLog: vi.fn()
}))

describe('Order Email Utilities', () => {
  const mockOrder: OrderWithItems = {
    id: 1,
    orderNumber: 'ORD-2024-001',
    userId: 'user-123',
    status: 'pending',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    subtotalEur: 100,
    shippingCostEur: 10,
    taxEur: 20,
    totalEur: 130,
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'Spain'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'Spain'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: []
  }

  const mockEmailLog: EmailLog = {
    id: 1,
    orderId: 1,
    emailType: 'order_confirmation',
    recipientEmail: 'test@example.com',
    subject: 'Order confirmation #ORD-2024-001',
    status: 'pending',
    attempts: 0,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendOrderConfirmationEmail', () => {
    it('should create email log entry', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-123' })

      await sendOrderConfirmationEmail({
        order: mockOrder,
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        locale: 'en'
      })

      expect(createEmailLog).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: mockOrder.id,
          emailType: 'order_confirmation',
          recipientEmail: 'test@example.com'
        })
      )
    })

    it('should send email with correct data', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog } = await import('~/server/utils/emailLogging')
      const { sendEmail, generateOrderConfirmationEmailHtml } = await import('~/server/utils/email')
      
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(generateOrderConfirmationEmailHtml).mockReturnValue('<html>Email content</html>')
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-123' })

      const result = await sendOrderConfirmationEmail({
        order: mockOrder,
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        locale: 'en'
      })

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          html: '<html>Email content</html>'
        })
      )
      expect(result.success).toBe(true)
    })

    it('should record successful email attempt', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog, recordEmailAttempt } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-123' })
      vi.mocked(recordEmailAttempt).mockResolvedValue(mockEmailLog)

      await sendOrderConfirmationEmail({
        order: mockOrder,
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        locale: 'en'
      })

      expect(recordEmailAttempt).toHaveBeenCalledWith(
        mockEmailLog.id,
        true,
        'email-123',
        undefined
      )
    })

    it('should handle email sending failure', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog, recordEmailAttempt } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(sendEmail).mockRejectedValue(new Error('Email service error'))
      vi.mocked(recordEmailAttempt).mockResolvedValue(mockEmailLog)

      const result = await sendOrderConfirmationEmail({
        order: mockOrder,
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        locale: 'en'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service error')
      expect(recordEmailAttempt).toHaveBeenCalledWith(
        mockEmailLog.id,
        false,
        undefined,
        'Email service error'
      )
    })
  })

  describe('Email subject generation', () => {
    it('should generate correct subject for different locales', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-123' })

      // Test Spanish
      await sendOrderConfirmationEmail({
        order: mockOrder,
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        locale: 'es'
      })

      expect(createEmailLog).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Confirmación de pedido')
        })
      )

      // Test English
      await sendOrderConfirmationEmail({
        order: mockOrder,
        customerName: 'John Doe',
        customerEmail: 'test@example.com',
        locale: 'en'
      })

      expect(createEmailLog).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Order confirmation')
        })
      )
    })
  })
})
