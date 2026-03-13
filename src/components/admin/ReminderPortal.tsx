'use client';

import { createPortal } from 'react-dom';
import ReminderModals from './ReminderModals';

interface ReminderPortalProps {
  showBeforeEndModal: boolean;
  showSpecificTimeModal: boolean;
  onCloseBeforeEnd: () => void;
  onCloseSpecificTime: () => void;
  reservationId: string;
  propertyTitle: string;
  customerName: string;
  reservationStartDate: string;
  reservationEndDate: string;
  onReminderCreated: () => void;
}

export default function ReminderPortal({
  showBeforeEndModal,
  showSpecificTimeModal,
  onCloseBeforeEnd,
  onCloseSpecificTime,
  reservationId,
  propertyTitle,
  customerName,
  reservationStartDate,
  reservationEndDate,
  onReminderCreated
}: ReminderPortalProps) {
  if (!showBeforeEndModal && !showSpecificTimeModal) {
    return null;
  }

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, pointerEvents: 'auto' }}>
      <ReminderModals
        showBeforeEndModal={showBeforeEndModal}
        showSpecificTimeModal={showSpecificTimeModal}
        onCloseBeforeEnd={onCloseBeforeEnd}
        onCloseSpecificTime={onCloseSpecificTime}
        reservationId={reservationId}
        propertyTitle={propertyTitle}
        customerName={customerName}
        reservationStartDate={reservationStartDate}
        reservationEndDate={reservationEndDate}
        onReminderCreated={onReminderCreated}
      />
    </div>,
    document.body
  );
}
