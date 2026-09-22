import React, { useState, useEffect } from 'react';
import { ProduceListing } from '../../types';
import { 
  getChecklistForCrop, 
  calculateSampleRequirement, 
  validateSampleObservation, 
  calculateQualityScore 
} from '../../services/qualityEngine';
import { QualityChecklistResult, QualitySampleObservation } from '../../types/quality';
import { QualityRepository } from '../../repositories/QualityRepository';
import { useTranslation } from 'react-i18next';

interface QualityVerificationModalProps {
  batch: ProduceListing;
  onClose: () => void;
  onSuccess: () => void;
}

export const QualityVerificationModal: React.FC<QualityVerificationModalProps> = ({ batch, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const config = getChecklistForCrop(batch.crop);
  const sampleSize = calculateSampleRequirement(batch.quantityKg);

  const [obs, setObs] = useState<QualitySampleObservation>({
    sampleSize,
    good: 0,
    damaged: 0,
    immature: 0,
    rejected: 0
  });

  const [checklist, setChecklist] = useState<QualityChecklistResult>({});
  
  useEffect(() => {
    const initialChecklist: QualityChecklistResult = {};
    config.parameters.forEach(p => {
      initialChecklist[p] = 'PASS';
    });
    setChecklist(initialChecklist);
  }, [config.parameters]);

  const handleObsChange = (field: keyof QualitySampleObservation, value: number) => {
    setObs(prev => ({ ...prev, [field]: value }));
  };

  const handleChecklistChange = (param: string, value: 'PASS' | 'FAIL' | 'SERIOUS_DEFECT') => {
    setChecklist(prev => ({ ...prev, [param]: value }));
  };

  const totalInputs = obs.good + obs.damaged + obs.immature + obs.rejected;
  const isValid = totalInputs === sampleSize;

  const result = calculateQualityScore(checklist, obs, config);

  const handleSubmit = async () => {
    if (!isValid) return;
    
    await QualityRepository.verifyCollection(
      batch.id,
      'CURRENT_USER_ID', // Replace with actual user ID from context
      obs,
      checklist,
      result
    );

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{t('quality.verificationTitle', 'Quality Verification')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">{batch.crop} - {batch.variety}</h3>
            <p className="text-sm text-blue-700 mt-1">{t('quality.declaredQuantity', 'Declared')}: {batch.quantityKg} kg</p>
            <p className="text-sm font-medium text-blue-800 mt-2">{t('quality.sampleRequired', 'Sample Required')}: {sampleSize} items</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">{t('quality.sampleResults', 'Sample Results')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600">{t('quality.good', 'Good')}</label>
                <input type="number" min="0" value={obs.good} onChange={(e) => handleObsChange('good', parseInt(e.target.value) || 0)} className="mt-1 w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">{t('quality.damaged', 'Damaged')}</label>
                <input type="number" min="0" value={obs.damaged} onChange={(e) => handleObsChange('damaged', parseInt(e.target.value) || 0)} className="mt-1 w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">{t('quality.immature', 'Immature')}</label>
                <input type="number" min="0" value={obs.immature} onChange={(e) => handleObsChange('immature', parseInt(e.target.value) || 0)} className="mt-1 w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">{t('quality.rejected', 'Rejected')}</label>
                <input type="number" min="0" value={obs.rejected} onChange={(e) => handleObsChange('rejected', parseInt(e.target.value) || 0)} className="mt-1 w-full p-2 border rounded" />
              </div>
            </div>
            {!isValid && (
              <p className="text-sm text-red-500 mt-2">
                {t('quality.totalMismatch', 'Total must equal')} {sampleSize} ({totalInputs} entered)
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">{t('quality.checklist', 'Checklist')}</h3>
            <div className="space-y-3">
              {config.parameters.map(param => (
                <div key={param} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{param}</span>
                  <select 
                    value={checklist[param] || 'PASS'}
                    onChange={(e) => handleChecklistChange(param, e.target.value as any)}
                    className="p-1.5 border border-gray-300 rounded bg-white text-sm"
                  >
                    <option value="PASS">{t('quality.pass', 'Pass')}</option>
                    <option value="FAIL">{t('quality.fail', 'Fail')}</option>
                    {config.seriousDefects.includes(param) && (
                      <option value="SERIOUS_DEFECT">{t('quality.seriousDefect', 'Serious Defect')}</option>
                    )}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800">{t('quality.calculatedScore', 'Calculated Score')}</h3>
            <div className="mt-2 flex items-end gap-4">
              <div className="text-3xl font-bold text-green-600">{result.score}/100</div>
              <div className="text-lg font-medium text-gray-700">Grade: {result.grade}</div>
            </div>
            {result.hasSeriousDefect && (
              <div className="mt-2 text-sm text-red-600 font-medium">
                {t('quality.reviewRequiredWarning', 'Review required due to serious defect.')}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">
              {t('quality.disclaimer', 'Visible marketplace quality — not laboratory certification')}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium">{t('common.cancel', 'Cancel')}</button>
          <button 
            onClick={handleSubmit} 
            disabled={!isValid}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {t('common.submit', 'Submit Verification')}
          </button>
        </div>
      </div>
    </div>
  );
};
