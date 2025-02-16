// File: flowData.js

export const initialNodes = [
  {
    id: '1',
    type: 'conversation',
    position: { x: 250, y: 0 },
    data: {
      label: 'Greeting',
      description: 'Hello! this is Alex from the London Medical Centre',
      nodeType: 'first',
      isFixedResponse: true,
      group: 'Initial Contact'
    }
  },
  {
    id: '2',
    type: 'conversation',
    position: { x: 250, y: 100 },
    data: {
      label: 'Identity Verification',
      description: 'Verify patient identity using standard procedures',
      nodeType: 'verification',
      group: 'Initial Contact'
    }
  },
  {
    id: '3',
    type: 'conversation',
    position: { x: 250, y: 200 },
    data: {
      label: 'Reason for the call',
      description: 'Ask how we can help today',
      nodeType: 'regular',
      group: 'Initial Contact'
    }
  },
  {
    id: '4',
    type: 'conversation',
    position: { x: 100, y: 350 },
    data: {
      label: 'Process Prescription Refill',
      description: 'Handle prescription refill request',
      nodeType: 'regular',
      group: 'Prescription'
    }
  },
  {
    id: '8',
    type: 'conversation',
    position: { x: 50, y: 450 },
    data: {
      label: 'Ready for Pickup',
      description: 'Inform patient their prescription can be picked up',
      nodeType: 'regular',
      group: 'Prescription'
    }
  },
  {
    id: '9',
    type: 'conversation',
    position: { x: 150, y: 450 },
    data: {
      label: 'Prescription Needs Prior Authorization',
      description: 'Inform patient that prior authorization is required',
      nodeType: 'regular',
      group: 'Prescription'
    }
  },
  {
    id: '11',
    type: 'conversation',
    position: { x: 250, y: 550 },
    data: {
      label: 'Finish call',
      description: 'Finish the call (Prescription branch)',
      nodeType: 'last',
      group: 'Prescription'
    }
  },
  {
    id: '6',
    type: 'conversation',
    position: { x: 400, y: 350 },
    data: {
      label: 'Patient Intake',
      description: 'Gather basic info about symptoms and urgency',
      nodeType: 'anamnesis',
      group: 'Intake'
    }
  },
  {
    id: '10',
    type: 'conversation',
    position: { x: 450, y: 550 },
    data: {
      label: 'Finish call',
      description: 'Finish the call (Intake branch)',
      nodeType: 'last',
      group: 'Intake'
    }
  }
];

export const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', data: { label: 'Verify ID' }, type: 'custom', animated: true },
  { id: 'e2-3', source: '2', target: '3', data: { label: 'Get reason' }, type: 'custom', animated: true },

  { id: 'e3-4', source: '3', target: '4', data: { label: 'Prescription refill' }, type: 'custom', animated: true },
  { id: 'e3-6', source: '3', target: '6', data: { label: 'Need to see doctor' }, type: 'custom', animated: true },

  { id: 'e6-10', source: '6', target: '10', data: { label: 'Finish call' }, type: 'custom', animated: true },

  { id: 'e4-8', source: '4', target: '8', data: { label: 'Prescription ready' }, type: 'custom', animated: true },
  { id: 'e4-9', source: '4', target: '9', data: { label: 'Authorization needed' }, type: 'custom', animated: true },
  { id: 'e8-11', source: '8', target: '11', data: { label: 'Finish call' }, type: 'custom', animated: true },
  { id: 'e9-11', source: '9', target: '11', data: { label: 'Finish call' }, type: 'custom', animated: true }
];
