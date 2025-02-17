import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const useDecisionTree = (selectedTemplate, organisationDetails) => {
  const { currentLanguage } = useLanguage();
  const [nodes, setNodes] = useState([]);
  const [activeNodes, setActiveNodes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [allNodesData, setAllNodesData] = useState({});

  useEffect(() => {
    const fetchAllNodes = async () => {
      console.log('🔍 Fetching all nodes...');
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
      console.log('📋 Setting active nodes from template:', selectedTemplate.activeNodes);
      const activeNodesSet = new Set(['GREETING', ...selectedTemplate.activeNodes]);
      setActiveNodes(activeNodesSet);
      
      // Update GREETING node paths based on selected template
      const updatedNodesData = {
        ...allNodesData,
        GREETING: {
          ...allNodesData.GREETING,
          paths: [{
            targetNode: selectedTemplate.activeNodes[0] || 'ANAMNESIS',
            sourceHandle: 'GREETING-source',
            targetHandle: `${selectedTemplate.activeNodes[0] || 'ANAMNESIS'}-target`
          }]
        }
      };
      
      // Filter nodes to only include active ones and convert to array
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
    loading: loading && Object.keys(allNodesData).length === 0,
    toggleNode,
    getNodeContent
  };
}; 