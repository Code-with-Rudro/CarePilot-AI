import { useState, useEffect, useCallback } from 'react';
import { MedicalDocument, DocumentType } from '../types/document';
import { apiClient } from '../lib/api-client';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [uploadProgress, setUploadProgress] = useState<{ step: string; percent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const docs = await apiClient.getDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err?.message || 'Failed to load medical records');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = async (file: File, documentType: DocumentType, facility?: string) => {
    try {
      setError(null);
      const newDoc = await apiClient.uploadDocument(file, documentType, facility, (step, percent) => {
        setUploadProgress({ step, percent });
      });
      setDocuments(prev => [newDoc, ...prev]);
      setUploadProgress(null);
      return newDoc;
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
      setUploadProgress(null);
      throw err;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.facilityOrDoctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || doc.documentType === selectedType;
    return matchesSearch && matchesType;
  });

  return {
    documents: filteredDocuments,
    allDocuments: documents,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    uploadProgress,
    error,
    uploadFile,
    refreshDocuments: fetchDocuments,
  };
};
