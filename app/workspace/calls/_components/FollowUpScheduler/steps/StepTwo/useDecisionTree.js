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

        // Add greeting node with message from organisation settings
        const remoteMonitoringSettings = organisationDetails?.settings?.remoteMonitoring || {};
        nodesData['GREETING'] = {
          id: 'GREETING',
          title: {
            en: 'Greeting',
            es: 'Saludo'
          },
          description: {
            en: remoteMonitoringSettings.firstMessage || `"Hello!"`,
            es: remoteMonitoringSettings.firstMessage || `"¡Hola!"`
          },
          activationInstructions: {
            en: '',
            es: ''
          },
          paths: []  // Will be updated when template changes
        };

        // For custom objectives templates, ensure CUSTOM_EXPERIENCE has path to FINISH_CALL
        if (nodesData['CUSTOM_EXPERIENCE']) {
          nodesData['CUSTOM_EXPERIENCE'] = {
            ...nodesData['CUSTOM_EXPERIENCE'],
            paths: [{
              targetNode: 'FINISH_CALL',
              sourceHandle: 'CUSTOM_EXPERIENCE-source',
              targetHandle: 'FINISH_CALL-target'
            }]
          };
        }

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
  }, [organisationDetails]);

  // Update nodes when template changes
  useEffect(() => {
    if (selectedTemplate && Object.keys(allNodesData).length > 0) {
      // First, determine if this is a custom objectives template
      const isCustomObjectives = selectedTemplate.type === 'customObjectives';
      
      // Set active nodes based on template type
      const activeNodesSet = new Set(
        isCustomObjectives 
          ? ['GREETING', 'CUSTOM_EXPERIENCE', 'FINISH_CALL']
          : ['GREETING', ...(Array.isArray(selectedTemplate.activeNodes) ? selectedTemplate.activeNodes : [])]
      );
      setActiveNodes(activeNodesSet);
      
      // Update GREETING node paths based on template type
      const updatedNodesData = {
        ...allNodesData,
        GREETING: {
          ...allNodesData.GREETING,
          paths: [{
            targetNode: isCustomObjectives ? 'CUSTOM_EXPERIENCE' : (selectedTemplate.activeNodes?.[0] || 'ANAMNESIS'),
            sourceHandle: 'GREETING-source',
            targetHandle: isCustomObjectives ? 'CUSTOM_EXPERIENCE-target' : `${selectedTemplate.activeNodes?.[0] || 'ANAMNESIS'}-target`
          }]
        }
      };

      if (isCustomObjectives) {
        // Ensure CUSTOM_EXPERIENCE has path to FINISH_CALL
        updatedNodesData['CUSTOM_EXPERIENCE'] = {
          ...allNodesData['CUSTOM_EXPERIENCE'],
          paths: [{
            targetNode: 'FINISH_CALL',
            sourceHandle: 'CUSTOM_EXPERIENCE-source',
            targetHandle: 'FINISH_CALL-target'
          }]
        };
      }
      
      // Filter nodes to only include active ones and use Firebase data
      const nodesArray = Object.values(updatedNodesData)
        .filter(node => activeNodesSet.has(node.id));
      
      setNodes(nodesArray);
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