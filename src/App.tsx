/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WiseProvider, useWise } from './context/WiseContext';
import { Navigation } from './components/Navigation';
import { TodayView } from './components/TodayView';
import { TalkView } from './components/TalkView';
import { ActionsView } from './components/ActionsView';
import { EvidenceView } from './components/EvidenceView';
import { ReviewView } from './components/ReviewView';
import { ModesModal } from './components/ModesModal';
import { CheckinModals } from './components/CheckinModals';
import { DataManagementModal } from './components/DataManagementModal';

const MainApp: React.FC = () => {
  const { activeTab } = useWise();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      <Navigation />

      <main className="flex-1 w-full" id="main-content">
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'talk' && <TalkView />}
        {activeTab === 'actions' && <ActionsView />}
        {activeTab === 'evidence' && <EvidenceView />}
        {activeTab === 'review' && <ReviewView />}
      </main>

      {/* Global Modals & Overlays */}
      <ModesModal />
      <CheckinModals />
      <DataManagementModal />
    </div>
  );
};

export default function App() {
  return (
    <WiseProvider>
      <MainApp />
    </WiseProvider>
  );
}
