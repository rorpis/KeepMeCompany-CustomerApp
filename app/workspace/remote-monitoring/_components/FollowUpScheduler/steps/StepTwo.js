'use client';

import React from "react";
import { useState } from 'react';
import { PlusCircle, Trash2, Edit2, Save } from "lucide-react";
import { Button } from "@/_components/ui/StyledButton";
import { SecondaryButton } from "@/app/_components/global_components";
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Card, CardContent } from "@/_components/ui/card";

const StepTwo = ({ 
  objectives,
  setObjectives,
  onBack,
  onNext,
  organisationDetails,
  setPresetName,
  setIsEditingPreset,
  selectedPresetIndex,
  setSelectedPresetIndex,
}) => {
  const { t } = useLanguage();
  const [newObjective, setNewObjective] = React.useState("");
  const [templateTitle, setTemplateTitle] = React.useState("");
  const [isEditingTemplate, setIsEditingTemplate] = React.useState(false);
  const [editingObjectiveIndex, setEditingObjectiveIndex] = React.useState(null);
  const [editingObjectiveText, setEditingObjectiveText] = React.useState("");

  // Get presets from organisationDetails
  const presets = organisationDetails?.settings?.remoteMonitoring?.presets || [];

  const handlePresetSelect = (index) => {
    if (index === "custom") {
      setSelectedPresetIndex(null);
      setPresetName("");
      setObjectives([]);
      setIsEditingTemplate(false);
      setTemplateTitle("");
      return;
    }

    const preset = presets[index];
    setSelectedPresetIndex(index);
    setPresetName(preset.title);
    setObjectives([...preset.objectives]);
    setTemplateTitle(preset.title);
    setIsEditingTemplate(false);
  };

  const handleSaveChanges = () => {
    setIsEditingTemplate(false);
    setIsEditingPreset(true);
  };

  const handleDeleteTemplate = () => {
    // Add delete logic here
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const handleDeleteObjective = (indexToDelete) => {
    setObjectives(objectives.filter((_, index) => index !== indexToDelete));
  };

  const handleEditObjective = (index) => {
    setEditingObjectiveIndex(index);
    setEditingObjectiveText(objectives[index]);
  };

  const handleSaveObjectiveEdit = () => {
    if (editingObjectiveText.trim()) {
      const newObjectives = [...objectives];
      newObjectives[editingObjectiveIndex] = editingObjectiveText.trim();
      setObjectives(newObjectives);
    }
    setEditingObjectiveIndex(null);
    setEditingObjectiveText("");
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 mb-4">
        <CardContent>
          <div className="flex gap-8 h-[calc(100vh-340px)]">
            {/* Left: Template Selection */}
            <div className="w-1/3 border-r pr-6">
              <h3 className="text-lg font-medium mb-4 text-black">
                Select Template
              </h3>
              <div className="space-y-3 overflow-y-auto h-[calc(100vh-400px)]">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(index)}
                    className={`w-full p-3 rounded-lg border text-black ${
                      selectedPresetIndex === index ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-500"
                    }`}
                  >
                    <span className="font-medium">{preset.title}</span>
                  </button>
                ))}
                <button
                  onClick={() => handlePresetSelect("custom")}
                  className={`w-full p-3 rounded-lg border text-black ${
                    selectedPresetIndex === null ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-medium">Custom Objectives</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right: Objectives */}
            <div className="flex-1 flex flex-col">
              {/* Title and buttons section */}
              {(selectedPresetIndex === null || selectedPresetIndex !== null) && (
                <div className="flex justify-between items-center mb-4">
                  {isEditingTemplate || selectedPresetIndex === null ? (
                    <>
                      <input
                        type="text"
                        value={templateTitle}
                        onChange={(e) => setTemplateTitle(e.target.value)}
                        placeholder="Enter template title..."
                        className="text-lg p-2 rounded-lg border text-black"
                      />
                      <div className="flex gap-2">
                        {selectedPresetIndex !== null && (
                          <Button 
                            variant="outline" 
                            onClick={handleDeleteTemplate}
                            className="text-red-600"
                          >
                            Delete Template
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={handleSaveChanges}
                          disabled={!templateTitle.trim() || objectives.length === 0}
                          className={`${
                            !templateTitle.trim() || objectives.length === 0
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-100"
                              : "text-black hover:bg-gray-100"
                          }`}
                        >
                          {selectedPresetIndex === null ? "Save Template" : "Save Changes"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-black">
                        {templateTitle}
                      </h3>
                      <Button 
                        variant="outline"
                        onClick={() => setIsEditingTemplate(true)}
                        className="text-black"
                      >
                        Edit Template
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Objectives list with fixed height and scroll */}
              <div className="flex-1 overflow-y-auto h-[calc(100vh-440px)]">
                <div className="space-y-2">
                  {objectives.map((objective, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg border bg-gray-50 text-black flex justify-between items-center"
                    >
                      {editingObjectiveIndex === index ? (
                        <input
                          type="text"
                          value={editingObjectiveText}
                          onChange={(e) => setEditingObjectiveText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveObjectiveEdit()}
                          className="flex-1 p-2 rounded-lg border mr-2"
                          autoFocus
                        />
                      ) : (
                        <span>{objective}</span>
                      )}
                      {(selectedPresetIndex === null || isEditingTemplate) && (
                        <div className="flex gap-2">
                          {editingObjectiveIndex === index ? (
                            <Button
                              variant="ghost"
                              onClick={handleSaveObjectiveEdit}
                              className="h-8 px-2 hover:bg-gray-200"
                            >
                              <Save className="h-4 w-4 text-gray-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => handleEditObjective(index)}
                              className="h-8 px-2 hover:bg-gray-200"
                            >
                              <Edit2 className="h-4 w-4 text-gray-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteObjective(index)}
                            className="h-8 px-2 hover:bg-gray-200"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add objective input */}
              {(selectedPresetIndex === null || isEditingTemplate) && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddObjective()}
                    placeholder="Add new objective..."
                    className="flex-1 p-2 rounded-lg border text-black placeholder-gray-500"
                  />
                  <Button variant="outline" onClick={handleAddObjective} className="text-black">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-border-main mt-auto">
        <SecondaryButton onClick={onBack} className="text-black">
          Back
        </SecondaryButton>
        <SecondaryButton 
          onClick={onNext}
          disabled={objectives.length === 0}
          className={objectives.length === 0 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
            : "bg-[#0F172A] hover:bg-[#1E293B] text-white"}
        >
          Continue
        </SecondaryButton>
      </div>
    </div>
  );
};

export default StepTwo; 