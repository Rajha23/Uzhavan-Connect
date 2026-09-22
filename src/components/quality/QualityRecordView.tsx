import React from 'react';
import { QualityVerificationRecord } from '../../types/quality';
import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface QualityRecordViewProps {
  record: QualityVerificationRecord;
  crop: string;
  variety?: string;
  quantityKg: number;
}

export const QualityRecordView: React.FC<QualityRecordViewProps> = ({ record, crop, variety, quantityKg }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{crop} {variety ? `- ${variety}` : ''}</h3>
          <p className="text-sm text-gray-600">Batch ID: {record.batchId || 'Pending'}</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            ${record.grade === 'PREMIUM' ? 'bg-green-100 text-green-800' : 
              record.grade === 'STANDARD' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
            {record.grade}
          </div>
          <p className="text-xs text-gray-500 mt-1">{quantityKg} kg</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">{t('quality.status', 'Verification Status')}</p>
            <p className="font-medium text-gray-800">{record.status}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">{t('quality.confidence', 'Confidence')}</p>
            <p className="font-medium text-gray-800">{record.confidence}</p>
          </div>
        </div>

        {record.calculatedScore !== undefined && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-blue-900 font-medium">{t('quality.qualityScore', 'Quality Score')}</p>
              <p className="text-3xl font-bold text-blue-700">{record.calculatedScore}<span className="text-lg text-blue-500">/100</span></p>
            </div>
            {record.hasSeriousDefect && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">Review Required</span>
              </div>
            )}
          </div>
        )}

        {record.sampleObservation && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('quality.sampleDetails', 'Sample Details')}</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">{t('quality.good', 'Good')}</p>
                <p className="font-medium text-gray-800">{record.sampleObservation.good}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">{t('quality.damaged', 'Damaged')}</p>
                <p className="font-medium text-gray-800">{record.sampleObservation.damaged}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">{t('quality.immature', 'Immature')}</p>
                <p className="font-medium text-gray-800">{record.sampleObservation.immature}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">{t('quality.rejected', 'Rejected')}</p>
                <p className="font-medium text-gray-800">{record.sampleObservation.rejected}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            {t('quality.disclaimer', 'Visible marketplace quality — not laboratory certification')}
          </p>
        </div>
      </div>
    </div>
  );
};
