import React, { useState } from 'react';
import { WorkflowOrder } from '../../types';
import { BuyerConfirmationStatus } from '../../types/quality';
import { QualityRepository } from '../../repositories/QualityRepository';
import { useTranslation } from 'react-i18next';

interface BuyerConfirmationModalProps {
  order: WorkflowOrder;
  onClose: () => void;
  onSuccess: () => void;
}

export const BuyerConfirmationModal: React.FC<BuyerConfirmationModalProps> = ({ order, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<BuyerConfirmationStatus>('ACCEPTED_AS_GRADED');
  const [reason, setReason] = useState('');
  const [reportedQuantity, setReportedQuantity] = useState(order.quantityKg);

  const isMismatch = status !== 'ACCEPTED_AS_GRADED' && status !== 'ACCEPTED_WITH_MINOR_ISSUE';

  const handleSubmit = async () => {
    if (isMismatch && !reason.trim()) {
      alert(t('quality.reasonRequired', 'A reason is required for mismatches.'));
      return;
    }

    await QualityRepository.buyerConfirm(order.id, 'CURRENT_USER_ID', {
      status,
      reason: reason || undefined,
      reportedQuantity: status === 'QUANTITY_MISMATCH' || status === 'PARTIALLY_ACCEPTED' ? reportedQuantity : undefined,
      timestamp: new Date().toISOString()
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{t('quality.confirmDelivery', 'Confirm Delivery')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800">{order.crop}</h3>
            <p className="text-sm text-gray-600">Expected: {order.quantityKg} kg • Grade: {order.qualityGrade}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('quality.confirmationStatus', 'Confirmation Status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BuyerConfirmationStatus)}
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option value="ACCEPTED_AS_GRADED">{t('quality.acceptedAsGraded', 'Accepted as Graded')}</option>
              <option value="ACCEPTED_WITH_MINOR_ISSUE">{t('quality.acceptedMinorIssue', 'Accepted with Minor Issue')}</option>
              <option value="PARTIALLY_ACCEPTED">{t('quality.partiallyAccepted', 'Partially Accepted')}</option>
              <option value="QUALITY_MISMATCH">{t('quality.qualityMismatch', 'Quality Mismatch')}</option>
              <option value="QUANTITY_MISMATCH">{t('quality.quantityMismatch', 'Quantity Mismatch')}</option>
              <option value="REJECTED">{t('quality.rejectedStatus', 'Rejected')}</option>
            </select>
          </div>

          {(status === 'QUANTITY_MISMATCH' || status === 'PARTIALLY_ACCEPTED') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('quality.receivedQuantity', 'Received Quantity (kg)')}</label>
              <input
                type="number"
                value={reportedQuantity}
                onChange={(e) => setReportedQuantity(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {isMismatch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('quality.reason', 'Reason / Description')}</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg"
                rows={3}
                placeholder={t('quality.reasonPlaceholder', 'Please describe the issue...')}
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium">{t('common.cancel', 'Cancel')}</button>
          <button 
            onClick={handleSubmit} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            {t('common.submit', 'Submit Confirmation')}
          </button>
        </div>
      </div>
    </div>
  );
};
