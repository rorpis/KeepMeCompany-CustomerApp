// Constants for emergency triage protocols and symptoms
export const RED_FLAG_SYMPTOMS = [
  'Stroke',
  'Chest Pain',
  'Breathing Difficulty',
  'Severe Allergic Reaction',
  'Major Bleeding',
  'Loss of Consciousness'
];

export const PROTOCOL_QUESTIONS = {
  'Stroke': ['F - Face: "Can they smile normally?"', 'A - Arms: "Can they lift both arms?"', 'S - Speech: "Is speech normal?"', 'T - Time: "When did it start?"'],
  'Chest Pain': ['T - Time: "When did it start?"', 'I - Intensity: "How severe?"', 'M - Movement: "Does it move anywhere?"', 'E - Extras: "Any other symptoms?"'],
  'Breathing Difficulty': ['A - Asthma: "Do you have asthma?"', 'I - Inhaler: "Used inhaler?"', 'R - Response: "Has it helped?"'],
  'Severe Allergic Reaction': ['A - Allergen: "What caused this?"', 'L - Location: "Where\'s the reaction?"', 'E - EpiPen: "Do you have one?"', 'R - Response: "Have you used it?"', 'T - Time: "When did this start?"'],
  'Major Bleeding': ['R - Rate: "How fast bleeding?"', 'E - Extent: "How much blood?"', 'D - Direct pressure: "Pressure applied?"'],
  'Loss of Consciousness': ['A - Alert: "Are they alert?"', 'V - Voice: "Responding to voice?"', 'P - Pain: "Responding to pain?"', 'U - Unresponsive: "Completely unresponsive?"']
};
