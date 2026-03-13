'use client';

import React, { useState, useCallback, useMemo } from 'react';

interface ContractData {
  propertyName: string;
  ownerName: string;
  ownerBirthDate: string;
  ownerCinNumber: string;
  ownerCinDate: string;
  ownerCinLocation: string;
  ownerAddress: string;
  tenantName: string;
  tenantBirthPlace: string;
  tenantBirthDate: string;
  tenantCinNumber: string;
  tenantCinDate: string;
  tenantCinLocation: string;
  tenantState: string;
  propertyAddress: string;
  guaranteeAmount: string;
  monthlyRent: string;
  contractLocation: string;
  contractDate: string;
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ContractData>;
}

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, initialData }) => {
  const [contractData, setContractData] = useState<ContractData>({
    propertyName: 'إقامة الأوراس',
    ownerName: '',
    ownerBirthDate: '',
    ownerCinNumber: '',
    ownerCinDate: '',
    ownerCinLocation: '',
    ownerAddress: '',
    tenantName: '',
    tenantBirthPlace: '',
    tenantBirthDate: '',
    tenantCinNumber: '',
    tenantCinDate: '',
    tenantCinLocation: '',
    tenantState: '',
    propertyAddress: '',
    guaranteeAmount: '',
    monthlyRent: '',
    contractLocation: '',
    contractDate: '',
    ...initialData
  });

  // Memoize the update handler to prevent recreation on every render
  const updateContractField = useCallback((field: keyof ContractData, value: string) => {
    setContractData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Memoize the print function
  const handlePrint = useCallback(() => {
    const printContent = document.getElementById('contract-content');
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  }, []);

  // Memoize the contract content to prevent unnecessary re-renders
  const contractContent = useMemo(() => (
    <div id="contract-content" className="text-right" dir="rtl">
      <div className="space-y-4">
        {/* Contract Title */}
        <div className="text-center mb-6">
          <h4 className="text-xl font-bold text-gray-900 mb-2">عقد كراء مسكن "إقامة الأوراس"</h4>
          <p className="text-gray-700">ما بين الموقعين أسفله:</p>
        </div>

        {/* First Party - Owner */}
        <div className="mb-6">
          <h5 className="font-bold text-lg mb-3">الطرف الأول (المالك):</h5>
          <p className="text-gray-700 leading-relaxed">
            المرقي العقاري السيد/ <input
              type="text"
              value={contractData.ownerName}
              onChange={(e) => updateContractField('ownerName', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="الاسم"
            /> المولود بتاريخ: <input
              type="date"
              value={contractData.ownerBirthDate}
              onChange={(e) => updateContractField('ownerBirthDate', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
            /> ، الحامل لبطاقة التعريف الوطنية رقم: <input
              type="text"
              value={contractData.ownerCinNumber}
              onChange={(e) => updateContractField('ownerCinNumber', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="رقم البطاقة"
            /> الصادرة بتاريخ: <input
              type="date"
              value={contractData.ownerCinDate}
              onChange={(e) => updateContractField('ownerCinDate', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
            /> من بلدية: <input
              type="text"
              value={contractData.ownerCinLocation}
              onChange={(e) => updateContractField('ownerCinLocation', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="البلدية"
            /> والكائن بـ: <input
              type="text"
              value={contractData.ownerAddress}
              onChange={(e) => updateContractField('ownerAddress', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="العنوان"
            />
          </p>
        </div>

        {/* Second Party - Tenant */}
        <div className="mb-6">
          <h5 className="font-bold text-lg mb-3">الطرف الثاني (المستأجر):</h5>
          <p className="text-gray-700 leading-relaxed">
            السيد/ <input
              type="text"
              value={contractData.tenantName}
              onChange={(e) => updateContractField('tenantName', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="الاسم"
            /> المولود بـ: <input
              type="text"
              value={contractData.tenantBirthPlace}
              onChange={(e) => updateContractField('tenantBirthPlace', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="مكان الميلاد"
            /> ، الحامل لبطاقة التعريف الوطنية رقم: <input
              type="text"
              value={contractData.tenantCinNumber}
              onChange={(e) => updateContractField('tenantCinNumber', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="رقم البطاقة"
            /> الصادرة بتاريخ: <input
              type="date"
              value={contractData.tenantCinDate}
              onChange={(e) => updateContractField('tenantCinDate', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
            /> من طرف: <input
              type="text"
              value={contractData.tenantCinLocation}
              onChange={(e) => updateContractField('tenantCinLocation', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="مكان الإصدار"
            /> ولاية: <input
              type="text"
              value={contractData.tenantState}
              onChange={(e) => updateContractField('tenantState', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="الولاية"
            />
          </p>
        </div>

        {/* Agreement */}
        <div className="mb-6">
          <h5 className="font-bold text-lg mb-3 text-center">وقع الوفاق والتراضي بين الطرفين على ما يلي:</h5>
        </div>

        {/* Article 1 */}
        <div className="mb-4">
          <h5 className="font-bold text-lg mb-2">الفصل 1: تعيين المسكن موضوع الكراء</h5>
          <p className="text-gray-700 leading-relaxed">
            بمقتضى هذا العقد، أستأجر بصفتي الطرف الأول للطرف الثاني السكن الإيجاري "إقامة الأوراس" الكائن بشارع <input
              type="text"
              value={contractData.propertyAddress}
              onChange={(e) => updateContractField('propertyAddress', e.target.value)}
              className="inline-block w-48 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="عنوان العقار"
            /> تحت جميع الضمانات الفعلية والقانونية.
          </p>
        </div>

        {/* Article 2 */}
        <div className="mb-4">
          <h5 className="font-bold text-lg mb-2">الفصل 2: المعاينة</h5>
          <p className="text-gray-700 leading-relaxed">
            لقد تم تفحص ومعاينة المسكن من طرف المستأجر قبل المكوث فيه، حيث تأكد من جاهزيته التامة والكاملة بتوفر جميع مستلزمات العيش من كهرباء، غاز، ماء، حنفيات، مصابيح، وهاتف، كما هو موضح في وثيقة محضر المعاينة.
          </p>
        </div>

        {/* Article 3 */}
        <div className="mb-4">
          <h5 className="font-bold text-lg mb-2">الفصل 3: مبلغ الضمان</h5>
          <p className="text-gray-700 leading-relaxed">
            يجب على المستأجر دفع مبلغ مالي مسبق كضمان يقدر بـ: <input
              type="text"
              value={contractData.guaranteeAmount}
              onChange={(e) => updateContractField('guaranteeAmount', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="المبلغ"
            /> دج. يسترجع المبلغ عند المغادرة مقابل عدم إلحاق أضرار بتجهيزات المبنى ودفع كل المستحقات الشهرية للإيجار.
          </p>
        </div>

        {/* Article 4 */}
        <div className="mb-4">
          <h5 className="font-bold text-lg mb-2">الفصل 4: الالتزامات وشروط العقد</h5>
          <p className="text-gray-700 leading-relaxed">
            يستلزم على المستأجر المحافظة على المسكن وإرجاعه إلى حالته التي وجد عليها بعد انتهاء العقد.<br/>
            الحفاظ على نظافة المسكن وعدم طلاء الجدران أو ترميمه إلا للضرورة القصوى وباستشارة المالك أولاً.<br/>
            يتعهد المستأجر بالقيام بأشغال الإصلاح التي تقتضيها الضرورة في صيانة المسكن دون قيد أو شرط.<br/>
            دفع مستحقات الكهرباء دون تأخير حسب نظام الاستهلاك.<br/>
            تسليم المفاتيح للمالك بإرجاعهما على حالتهما الطبيعية عند انتهاء العقد.<br/>
            احترام الجيران وأعوان الأمن وعدم إزعاجهم، والتقيد بالتعليمات الخاصة بالمرآب وساحة لعب الأطفال.<br/>
            يمنع منعاً باتاً تسليم مفاتيح المسكن لمستأجر آخر دون علم المالك.
          </p>
        </div>

        {/* Article 5 */}
        <div className="mb-4">
          <h5 className="font-bold text-lg mb-2">الفصل 5: ثمن الكراء</h5>
          <p className="text-gray-700 leading-relaxed">
            تحديد ثمن الكراء بمبلغ: <input
              type="text"
              value={contractData.monthlyRent}
              onChange={(e) => updateContractField('monthlyRent', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="المبلغ"
            /> دج للشهر الواحد.<br/>
            يتم الدفع لثلاثة أشهر (الطريقة الثلاثية).<br/>
            في حالة عدم احترام الشروط أو التأخر في الدفع، للمالك حق توجيه إنذار يمهله 03 أيام قبل ممارسة إجراءات فسخ العقد بقوة القانون.
          </p>
        </div>

        {/* Article 6 */}
        <div className="mb-4">
          <h5 className="font-bold text-lg mb-2">الفصل 6: ما يترتب على المستأجر حال خروجه</h5>
          <p className="text-gray-700 leading-relaxed">
            في حالة رغبة المستأجر في إخلاء المسكن قبل نهاية العقد، يجب إعلام المالك قبل 15 يوماً، وإلا ستحتسب مدة فراغ المسكن على عاتق المستأجر.
          </p>
        </div>

        {/* Article 7 */}
        <div className="mb-6">
          <h5 className="font-bold text-lg mb-2">الفصل 7: نهاية العقد والأحكام القضائية</h5>
          <p className="text-gray-700 leading-relaxed">
            يفسخ العقد تلقائياً في حالة الإخلال بأي من الشروط المذكورة أعلاه.<br/>
            في حالة عدم الامتثال، يتم اللجوء إلى العدالة القضائية لدى محكمة "المشرية" للفصل في القضية.
          </p>
        </div>

        {/* Contract Location and Date */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            حرر بـ: <input
              type="text"
              value={contractData.contractLocation}
              onChange={(e) => updateContractField('contractLocation', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
              placeholder="المكان"
            /> بتاريخ: <input
              type="date"
              value={contractData.contractDate}
              onChange={(e) => updateContractField('contractDate', e.target.value)}
              className="inline-block w-32 px-1 border-b-2 border-gray-400 focus:outline-none focus:border-gray-600 bg-transparent"
            />
          </p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="font-bold mb-4">إمضاء المالك</p>
            <div className="border-b-2 border-gray-400 w-48"></div>
          </div>
          <div className="text-center">
            <p className="font-bold mb-4">إمضاء المستأجر</p>
            <div className="border-b-2 border-gray-400 w-48"></div>
          </div>
        </div>
      </div>
    </div>
  ), [contractData, updateContractField]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 "
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
          <h3 className="text-2xl font-bold text-gray-800">عقد كراء مسكن</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {contractContent}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            طباعة العقد
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
