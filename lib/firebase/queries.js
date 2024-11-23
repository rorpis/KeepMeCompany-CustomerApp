import { getDocFromFirestore } from './utils';

export const fetchExampleCalls = async () => {
  try {
    const docData = await getDocFromFirestore('/settings/customerApp/onboarding/demo');

    if (docData && docData.exampleCalls) {
      const exampleCalls = docData.exampleCalls;
      return exampleCalls;
    } else {
      console.log('No exampleCalls field found.');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch exampleCalls:', error);
    return [];
  }
};
