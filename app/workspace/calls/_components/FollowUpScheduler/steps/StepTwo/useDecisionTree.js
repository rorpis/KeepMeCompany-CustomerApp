import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const useDecisionTree = (selectedTemplate, organisationDetails) => {
  const { currentLanguage } = useLanguage();
  const [nodes, setNodes] = useState([]);
  const [activeNodes, setActiveNodes] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [allNodesData, setAllNodesData] = useState({});

  useEffect(() => {
    const fetchAllNodes = async () => {
      setLoading(true);
      try {
        const nodesSnapshot = await getDocs(collection(db, 'nodes'));
        const nodesData = {};
        
        // Transform the data as we store it
        nodesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          nodesData[doc.id] = {
            id: doc.id,
            title: {
              en: data.Title?.EN || 'Untitled',
              es: data.Title?.ES || 'Sin título',
            },
            description: {
              en: data.Description?.EN || '',
              es: data.Description?.ES || '',
            },
            activationInstructions: {
              en: data.ActivationInstruction?.EN || '',
              es: data.ActivationInstruction?.ES || '',
            },
            paths: (data.Paths || []).map(path => {
              const targetNode = typeof path === 'string' ? path : path.TargetNode;
              return {
                targetNode,
                sourceHandle: `${doc.id}-source`,
                targetHandle: `${targetNode}-target`
              };
            }),
            objectives: {
              en: data.Objectives?.EN || [],
              es: data.Objectives?.ES || [],
            }
          };
        });

        // Add greeting node
        nodesData['GREETING'] = {
          id: 'GREETING',
          title: {
            en: 'Greeting',
            es: 'Saludo'
          },
          description: {
            en: `"Hello! this is Alex from the London Medical Centre"`,
            es: `"¡Hola! soy Alex del Centro Médico de Londres"`
          },
          activationInstructions: {
            en: '',
            es: ''
          },
          paths: []  // Will be updated when template changes
        };

        // Add custom objectives node
        nodesData['CUSTOM_OBJECTIVES'] = {
          id: 'CUSTOM_OBJECTIVES',
          title: {
            en: 'Custom Objectives',
            es: 'Objetivos Personalizados'
          },
          description: {
            en: 'Custom follow-up objectives',
            es: 'Objetivos de seguimiento personalizados'
          },
          activationInstructions: {
            en: '',
            es: ''
          },
          paths: [{
            targetNode: 'FINISH_CALL',
            sourceHandle: 'CUSTOM_OBJECTIVES-source',
            targetHandle: 'FINISH_CALL-target'
          }]
        };

        // Add finish call node
        nodesData['FINISH_CALL'] = {
          id: 'FINISH_CALL',
          title: {
            en: 'Finish Call',
            es: 'Finalizar Llamada'
          },
          description: {
            en: 'End the follow-up call',
            es: 'Finalizar la llamada de seguimiento'
          },
          activationInstructions: {
            en: '',
            es: ''
          },
          paths: []
        };

        setAllNodesData(nodesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching nodes:', error);
        setLoading(false);
      }
    };

    if (Object.keys(allNodesData).length === 0) {
      fetchAllNodes();
    }
  }, []);

  // Update nodes when template changes
  useEffect(() => {
    if (selectedTemplate && Object.keys(allNodesData).length > 0) {
      // Only spread activeNodes if it exists and is an array
      const templateNodes = Array.isArray(selectedTemplate.activeNodes) 
        ? selectedTemplate.activeNodes 
        : [];
      
      const activeNodesSet = new Set(['GREETING', ...templateNodes]);
      setActiveNodes(activeNodesSet);
      
      // Update GREETING node paths based on selected template
      const updatedNodesData = {
        ...allNodesData,
        GREETING: {
          ...allNodesData.GREETING,
          paths: [{
            targetNode: templateNodes[0] || 'ANAMNESIS',
            sourceHandle: 'GREETING-source',
            targetHandle: `${templateNodes[0] || 'ANAMNESIS'}-target`
          }]
        }
      };
      
      // Filter nodes to only include active ones and convert to array
      const nodesArray = Object.values(updatedNodesData)
        .filter(node => activeNodesSet.has(node.id));
      
      setNodes(nodesArray);

      // Update GREETING node paths for custom objectives
      if (selectedTemplate?.type === 'customObjectives') {
        updatedNodesData.GREETING.paths = [{
          targetNode: 'CUSTOM_OBJECTIVES',
          sourceHandle: 'GREETING-source',
          targetHandle: 'CUSTOM_OBJECTIVES-target'
        }];
      }
    }
  }, [selectedTemplate, allNodesData]);

  const toggleNode = useCallback((nodeId) => {
    setActiveNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const getNodeContent = useCallback((node, langKey = currentLanguage?.toLowerCase()) => {
    return {
      title: node.title?.[langKey] || node.title?.en || '',
      description: node.description?.[langKey] || node.description?.en || '',
      instructions: node.activationInstructions?.[langKey] || node.activationInstructions?.en || '',
      objectives: node.objectives?.[langKey] || node.objectives?.en || []
    };
  }, [currentLanguage]);

  return {
    nodes,
    activeNodes,
    loading,
    toggleNode,
    getNodeContent
  };
}; 