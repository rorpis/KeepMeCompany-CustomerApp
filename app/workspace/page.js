'use client';

import { useState } from 'react';
import { ReadyToOperate } from './_dashboards/admin_dashboard';
import { AddBalance } from './_functional_views/add-balance';

const PRICE_PER_CALL = 0.53;

export default function WorkspacePage() {
  const [practiceData, setPracticeData] = useState({
    name: 'The Good Practice',
    patients: Number('14000'),
    address: 'Claverton Street, Bath',
    dailyCapacity: Number('30'),
    balance: Number('45.3')
  });

  const [completedTasks, setCompletedTasks] = useState({
    'Telephony Connection': false,
    'Add Balance': false,
    'Data Sharing Agreement': false,
    'Patient List': false
  });

  const [currentView, setCurrentView] = useState('dashboard');

  // Calculate daily operation cost
  const dailyOperationCost = parseFloat(practiceData.dailyCapacity) * PRICE_PER_CALL;

  const handleBalanceUpdate = (newBalance) => {
    setPracticeData(prev => ({
      ...prev,
      balance: Number(newBalance)
    }));
    setCompletedTasks(prev => ({
      ...prev,
      'Add Balance': true
    }));
    setCurrentView('dashboard');
  };

  return currentView === 'dashboard' ? (
    <ReadyToOperate 
      practiceData={practiceData}
      setPracticeData={setPracticeData}
      completedTasks={completedTasks}
      setCompletedTasks={setCompletedTasks}
      onAddBalanceClick={() => setCurrentView('add-balance')}
      dailyOperationCost={dailyOperationCost}
    />
  ) : (
    <AddBalance 
      currentBalance={practiceData.balance}
      onBalanceUpdate={handleBalanceUpdate}
      onClose={() => setCurrentView('dashboard')}
      dailyOperationCost={dailyOperationCost}
    />
  );
} 