'use client';

import React, { useState, useCallback, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  propertyName: string;
  propertyAddress: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  reservationId: string;
  notes: string[];
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceData }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return 'غير محدد';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'غير محدد';
      return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      return 'غير محدد';
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return new Intl.NumberFormat('ar-DZ', { 
        style: 'currency', 
        currency: 'DZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(0);
    }
    return new Intl.NumberFormat('ar-DZ', { 
      style: 'currency', 
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate nights
  const calculateNights = (): number => {
    try {
      const start = new Date(invoiceData.startDate);
      const end = new Date(invoiceData.endDate);
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 0;
      }
      
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(nights) || nights < 0 ? 0 : nights;
    } catch (error) {
      return 0;
    }
  };

  // Generate PDF
  const handleDownloadPDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      
      const element = document.getElementById('invoice-content');
      if (!element) {
        console.error('Invoice content element not found');
        return;
      }

      // Capture the invoice content as image
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add pages
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename and download
      const fileName = `فاتورة-${invoiceData.invoiceNumber}-${invoiceData.customerName}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [invoiceData]);

  // Print invoice
  const handlePrint = useCallback(() => {
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  }, []);

  // Invoice content
  const invoiceContent = useMemo(() => (
    <div id="invoice-content" className="text-right" dir="rtl" style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
        {/* Logo in top right corner */}
        <div style={{ position: 'absolute', top: '0', right: '0' }}>
          <img 
            src="/IMG_1642.PNG" 
            alt="Logo" 
            style={{ 
              width: '100px', 
              height: '100px',
              objectFit: 'contain'
            }}
          />
        </div>
        
        {/* Invoice Title */}
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000', marginBottom: '10px' }}>فاتورة حجز</h1>
        <p style={{ fontSize: '16px', color: '#000000', margin: 0 }}> Mimorent - للكراء وبيع العقارات - نظام الحجز</p>
      </div>

      {/* Invoice Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <div>
          <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>رقم الفاتورة</p>
          <p style={{ margin: '5px 0', fontSize: '16px', color: '#000000' }}>{invoiceData.invoiceNumber}</p>
        </div>
        <div>
          <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>تاريخ الإصدار</p>
          <p style={{ margin: '5px 0', fontSize: '16px', color: '#000000' }}>{formatDate(invoiceData.invoiceDate)}</p>
        </div>
        <div>
          <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>حالة الدفع</p>
          <p style={{ 
            margin: '5px 0', 
            fontSize: '16px', 
            color: invoiceData.paymentStatus === 'paid' ? '#28a745' : invoiceData.paymentStatus === 'partial' ? '#ffc107' : '#dc3545',
            fontWeight: 'bold'
          }}>
            {invoiceData.paymentStatus === 'paid' ? 'مدفوع بالكامل' : 
             invoiceData.paymentStatus === 'partial' ? 'مدفوع جزئياً' : 'لم يتم الدفع'}
          </p>
        </div>
      </div>

      {/* Customer Info and Reservation Details */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '20px' }}>
        {/* Customer Info - Left Half */}
        <div style={{ flex: '1' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000000' }}>معلومات العميل</h2>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            height: '100%'
          }}>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#000000' }}><strong>الاسم:</strong> {invoiceData.customerName}</p>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#000000' }}><strong>رقم الهاتف:</strong> {invoiceData.customerPhone}</p>
          </div>
        </div>

        {/* Reservation Details - Right Half */}
        <div style={{ flex: '1' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000000' }}>تفاصيل الحجز</h2>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            height: '100%'
          }}>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#000000' }}><strong>العقار:</strong> {invoiceData.propertyName}</p>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#000000' }}><strong>العنوان:</strong> {invoiceData.propertyAddress}</p>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#000000' }}><strong>تاريخ البدء:</strong> {formatDate(invoiceData.startDate)}</p>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#000000' }}><strong>تاريخ الانتهاء:</strong> {formatDate(invoiceData.endDate)}</p>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#000000' }}><strong>عدد الليالي:</strong> {calculateNights()} ليلة</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div style={{ marginBottom: '30px', marginTop: '50px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000000' }}>تفصيل التكاليف</h2>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          backgroundColor: '#ffffff',
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#24697f', color: 'white' }}>
              <th style={{ 
                padding: '16px 20px', 
                textAlign: 'right', 
                fontSize: '15px', 
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif',
                direction: 'rtl'
              }}>الوصف</th>
              <th style={{ 
                padding: '16px 20px', 
                textAlign: 'center', 
                fontSize: '15px', 
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif',
                direction: 'rtl'
              }}>عدد الأيام</th>
              <th style={{ 
                padding: '16px 20px', 
                textAlign: 'left', 
                fontSize: '15px', 
                fontWeight: '600',
                fontFamily: 'Arial, sans-serif',
                direction: 'rtl'
              }}>السعر</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ 
                padding: '16px 20px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#000000',
                fontFamily: 'Arial, sans-serif',
                direction: 'rtl'
              }}>
                رسوم الحجز ({calculateNights()} ليلة)
              </td>
              <td style={{ 
                padding: '16px 20px', 
                textAlign: 'center', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#000000',
                backgroundColor: '#f1f5f9',
                fontFamily: 'Arial, sans-serif',
                direction: 'rtl'
              }}>
                {calculateNights()}
              </td>
              <td style={{ 
                padding: '16px 20px', 
                textAlign: 'left', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#059669',
                fontFamily: 'Arial, sans-serif',
                direction: 'rtl'
              }}>
                {formatCurrency(invoiceData.totalPrice)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          float: 'left', 
          padding: '24px 28px', 
          background: 'linear-gradient(135deg, #24697f 0%, #2a7f9a 100%)', 
          color: 'white', 
          borderRadius: '16px', 
          minWidth: '280px',
          boxShadow: '0 10px 25px rgba(36, 105, 127, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', opacity: '0.9' }}>الإجمالي:</span>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>{formatCurrency(invoiceData.totalPrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', opacity: '0.9' }}>المدفوع:</span>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>{formatCurrency(invoiceData.paidAmount)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '16px', 
            borderTop: '2px solid rgba(255, 255, 255, 0.3)',
            fontWeight: '700',
            fontSize: '18px',
            alignItems: 'center'
          }}>
            <span>المتبقي:</span>
            <span style={{ 
              color: invoiceData.remainingAmount > 0 ? '#fbbf24' : '#10b981',
              textShadow: invoiceData.remainingAmount > 0 ? '0 2px 4px rgba(251, 191, 36, 0.3)' : '0 2px 4px rgba(16, 185, 129, 0.3)'
            }}>
              {formatCurrency(invoiceData.remainingAmount)}
            </span>
          </div>
        </div>
        <div style={{ clear: 'both' }}></div>
      </div>

      {/* Notes */}
      {invoiceData.notes && invoiceData.notes.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#000000' }}>ملاحظات</h2>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            {invoiceData.notes.map((note, index) => (
              <p key={index} style={{ 
                margin: '8px 0', 
                fontSize: '14px',
                color: '#000000',
                lineHeight: '1.5'
              }}>• {note}</p>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#000000' }}>
        <p>شكراً  </p>
        <p>هذه الفاتورة صالحة لأغراض المحاسبة والتسجيل</p>
      </div>
    </div>
  ), [invoiceData, calculateNights, formatDate, formatCurrency]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-4xl relative z-[100000] max-h-[90vh] overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">معاينة الفاتورة</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {invoiceContent}

        <div className="flex space-x-3 pt-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 px-4 py-2 mx-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            طباعة الفاتورة
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg transition-colors ${
              isGeneratingPDF ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-700'
            }`}
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin inline-block ml-2">
                  <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
                </div>
                جاري التحميل...
              </>
            ) : (
              'تحميل PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
