// =============================================
// ORDER EMAIL UTILITIES TESTS
// =============================================
// Unit tests for order email utilities
// Requirements: 1.1, 4.1, 4.2

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EmailLog } from '~/types/email'
import type { OrderEmailData } from '~/server/utils/emailTemplates'

const resolveSupabaseClientMock = vi.hoisted(() => vi.fn())
const generateOrderConfirmationTemplateMock = vi.hoisted(() => vi.fn())
const getOrderConfirmationSubjectMock = vi.hoisted(() => vi.fn())

// Mock dependencies
vi.mock('~/server/utils/email', () => ({
  sendEmail: vi.fn()
}))

vi.mock('~/server/utils/emailTemplates/orderConfirmation', () => ({
  generateOrderConfirmationTemplate: generateOrderConfirmationTemplateMock,
  getOrderConfirmationSubject: getOrderConfirmationSubjectMock
}))

vi.mock('~/server/utils/emailLogging', () => ({
  createEmailLog: vi.fn(),
  updateEmailLog: vi.fn(),
  recordEmailAttempt: vi.fn(),
  getEmailLog: vi.fn()
}))

vi.mock('~/server/utils/supabaseAdminClient', () => ({
  resolveSupabaseClient: resolveSupabaseClientMock
}))

function createSupabaseStub(orderId: number) {
  const single = vi.fn().mockResolvedValue({ data: { id: orderId } })
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))

  return {
    from,
    _mocks: { select, eq, single }
  }
}

describe('Order Email Utilities', () => {
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

  const mockEmailData: OrderEmailData = {
    customerName: 'John Doe',
    customerEmail: 'test@example.com',
    orderNumber: 'ORD-2024-001',
    orderDate: '2024-01-15T10:00:00.000Z',
    orderItems: [
      {
        productId: 'prod-1',
        name: 'Purcari Cabernet Sauvignon',
        quantity: 2,
        price: 25,
        total: 50
      },
      {
        productId: 'prod-2',
        name: 'Moldovan Honey',
        quantity: 1,
        price: 20,
        total: 20
      }
    ],
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
    subtotal: 120,
    shippingCost: 10,
    tax: 21,
    total: 151,
    paymentMethod: 'credit_card',
    locale: 'en'
  }

  let supabaseStub: ReturnType<typeof createSupabaseStub>

  beforeEach(() => {
    vi.clearAllMocks()

    supabaseStub = createSupabaseStub(mockEmailLog.orderId)
    resolveSupabaseClientMock.mockReturnValue(supabaseStub as any)
    generateOrderConfirmationTemplateMock.mockReturnValue('<html>Email content</html>')
    getOrderConfirmationSubjectMock.mockImplementation((_orderNumber: string, locale: string) => {
      return locale === 'en' ? 'Order confirmation' : `Confirmación (${locale})`
    })
  })

  describe('sendOrderConfirmationEmail', () => {
    it('should create email log entry', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      const { recordEmailAttempt } = await import('~/server/utils/emailLogging')
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-123' })
      vi.mocked(recordEmailAttempt).mockResolvedValue(mockEmailLog)

      await sendOrderConfirmationEmail(mockEmailData)

      expect(createEmailLog).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: mockEmailLog.orderId,
          emailType: 'order_confirmation',
          recipientEmail: mockEmailData.customerEmail,
          subject: 'Order confirmation'
        }),
        supabaseStub
      )
    })

    it('should send email with correct data', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      const { recordEmailAttempt } = await import('~/server/utils/emailLogging')

      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-123' })
      vi.mocked(recordEmailAttempt).mockResolvedValue(mockEmailLog)

      const result = await sendOrderConfirmationEmail(mockEmailData)

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockEmailData.customerEmail,
          subject: 'Order confirmation',
          html: '<html>Email content</html>'
        })
      )
      expect(result.success).toBe(true)
      expect(generateOrderConfirmationTemplateMock).toHaveBeenCalledWith(mockEmailData)
    })

    it('should record successful email attempt', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog, recordEmailAttempt } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-123' })
      vi.mocked(recordEmailAttempt).mockResolvedValue(mockEmailLog)

      await sendOrderConfirmationEmail(mockEmailData)

      expect(recordEmailAttempt).toHaveBeenCalledWith(
        mockEmailLog.id,
        true,
        'email-123',
        undefined,
        supabaseStub
      )
    })

    it('should handle email sending failure', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog, recordEmailAttempt } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      vi.mocked(sendEmail).mockRejectedValue(new Error('Email service error'))
      vi.mocked(recordEmailAttempt).mockResolvedValue(mockEmailLog)

      const result = await sendOrderConfirmationEmail(mockEmailData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service error')
      expect(recordEmailAttempt).toHaveBeenCalledWith(
        mockEmailLog.id,
        false,
        undefined,
        'Email service error',
        supabaseStub
      )
    })
  })

  describe('Email subject generation', () => {
    it('should generate correct subject for different locales', async () => {
      const { sendOrderConfirmationEmail } = await import('~/server/utils/orderEmails')
      const { createEmailLog } = await import('~/server/utils/emailLogging')
      const { sendEmail } = await import('~/server/utils/email')
      
      vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-123' })

      // Spanish locale
      vi.mocked(createEmailLog).mockResolvedValue(mockEmailLog)
      await sendOrderConfirmationEmail({ ...mockEmailData, locale: 'es' })

      expect(createEmailLog).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Confirmación (es)'
        }),
        supabaseStub
      )

      vi.mocked(createEmailLog).mockClear()

      // English locale
      await sendOrderConfirmationEmail(mockEmailData)

      expect(createEmailLog).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Order confirmation'
        }),
        supabaseStub
      )
    })
  })
})
