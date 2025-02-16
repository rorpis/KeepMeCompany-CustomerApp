import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const useDecisionTree = (selectedTemplate, organisationDetails) => {
  const { currentLanguage } = useLanguage();
  const [nodes, setNodes] = useState([]);
  const [activeNodes, setActiveNodes] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      console.log('🔍 Fetching nodes...', { selectedTemplate });
      setLoading(true);
      try {
        // Set active nodes from the selected template
        if (selectedTemplate?.activeNodes) {
          console.log('📋 Setting active nodes from template:', selectedTemplate.activeNodes);
          setActiveNodes(new Set(['GREETING', ...selectedTemplate.activeNodes]));
        }

        // Create greeting node
        const greetingNode = {
          id: 'GREETING',
          title: {
            en: 'Greeting',
            es: 'Saludo'
          },
          description: {
            en: `"Hello! this is Alex from the London Medical Centre"`,
            es: `"¡Hola! soy Alex del Centro Médico de Londres"`
          },
          paths: [{
            targetNode: selectedTemplate?.activeNodes?.[0] || 'ANAMNESIS',
            sourceHandle: 'GREETING-source',
            targetHandle: `${selectedTemplate?.activeNodes?.[0] || 'ANAMNESIS'}-target`
          }]
        };

        // Fetch nodes and filter to only include active ones plus greeting
        const nodesSnapshot = await getDocs(collection(db, 'nodes'));
        const fetchedNodes = nodesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: {
              en: data.Title?.EN || 'Untitled',
              es: data.Title?.ES || '',
            },
            description: {
              en: data.Description?.EN || '',
              es: data.Description?.ES || '',
            },
            paths: (data.Paths || []).map(path => {
              const targetNode = typeof path === 'string' ? path : path.TargetNode;
              return {
                targetNode,
                sourceHandle: `${doc.id}-source`,
                targetHandle: `${targetNode}-target`
              };
            }),
            activationInstructions: {
              en: data.ActivationInstructions?.EN || '',
              es: data.ActivationInstructions?.ES || '',
            },
            objectives: {
              en: data.Objectives?.EN || [],
              es: data.Objectives?.ES || [],
            }
          };
        });
        
        // Filter nodes to only include active ones and the greeting node
        const activeNodeIds = new Set(['GREETING', ...selectedTemplate.activeNodes]);
        const filteredNodes = [
          greetingNode,
          ...fetchedNodes.filter(node => activeNodeIds.has(node.id))
        ];
        
        setNodes(filteredNodes);
      } catch (error) {
        console.error('❌ Error fetching nodes:', error);
        setNodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, [selectedTemplate]);

  const toggleNode = (nodeId) => {
    setActiveNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getNodeContent = (node) => {
    return {
      title: node.title[currentLanguage] || node.title['en'],
      description: node.description[currentLanguage] || node.description['en'],
      instructions: node.activationInstructions?.[currentLanguage] || node.activationInstructions?.['en'],
      objectives: node.objectives?.[currentLanguage] || node.objectives?.['en'] || []
    };
  };

  return {
    nodes,
    activeNodes,
    loading,
    toggleNode,
    getNodeContent
  };
}; 