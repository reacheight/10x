import type { FC } from 'react';
import React, { useState, useCallback, useEffect, memo } from 'react';
import { getGlobal, withGlobal } from '../../../global';
import styles from './WorkspaceSettingsPage.module.scss';

import { useStorage } from '../../../hooks/useStorage.react';
import { Workspace } from '../../../types';

interface OwnProps {
  onBack: () => void;
  workspaceId?: string;
}

const WorkspaceSettingsPage: FC<OwnProps> = ({
  onBack,
  workspaceId,
}) => {
  const global = getGlobal();
  const chatFoldersById = global.chatFolders.byId;
  const orderedFolderIds = global.chatFolders.orderedIds;
  const folders = orderedFolderIds ? orderedFolderIds.map((id) => chatFoldersById[id]).filter(Boolean) : [];

  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const { savedWorkspaces, setSavedWorkspaces, setCurrentWorkspaceId } = useStorage();

  useEffect(() => {
    if (workspaceId) {
      const workspace = savedWorkspaces.find(w => w.id === workspaceId);
      if (workspace) {
        setWorkspaceName(workspace.name);
        setSelectedFolderIds(workspace.foldersIds || []);
      }
    }
  }, [workspaceId, savedWorkspaces]);

  const isFormValid = selectedFolderIds.length > 0 && workspaceName.trim() !== '';

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = workspaceName.trim();
    if (isFormValid) {
      if (workspaceId) {
        setSavedWorkspaces(
          savedWorkspaces.map(w =>
            w.id === workspaceId ? { ...w, name: trimmedName, folderIds: selectedFolderIds } : w
          )
        );
      } else {
        const newWorkspace: Workspace = {
          id: Date.now().toString(),
          name: trimmedName,
          foldersIds: selectedFolderIds,
        };
        setSavedWorkspaces([...savedWorkspaces, newWorkspace]);
        setCurrentWorkspaceId(newWorkspace.id);
      }
      onBack();
    }
  }, [workspaceName, selectedFolderIds, workspaceId, onBack, setSavedWorkspaces, savedWorkspaces, isFormValid]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkspaceName(e.target.value);
  }, [setWorkspaceName]);

  const handleFolderSelect = useCallback((folderId: number) => {
    setSelectedFolderIds(prevIds =>
      prevIds.includes(folderId)
        ? prevIds.filter(id => id !== folderId)
        : [...prevIds, folderId]
    );
  }, [setSelectedFolderIds]);

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>Back</button>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            id="workspace-name"
            type="text"
            value={workspaceName}
            onChange={handleNameChange}
            placeholder="Workspace name"
            required
            className={styles.input}
          />
        </div>
        <div className={styles.folderSelection}>
          <h3 className={styles.folderSelectionTitle}>Select folders:</h3>
          {folders.map((folder) => (
            <label key={folder.id} className={styles.folderCheckbox}>
              <input
                type="checkbox"
                checked={selectedFolderIds.includes(folder.id)}
                onChange={() => handleFolderSelect(folder.id)}
              />
              {folder.title}
            </label>
          ))}
        </div>
        <button 
          type="submit" 
          className={styles.button} 
          disabled={!isFormValid}
        >
          {workspaceId ? 'Update' : 'Create'} Workspace
        </button>
      </form>
    </div>
  );
};

export default WorkspaceSettingsPage;
