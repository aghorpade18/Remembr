import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Button, Input, Menu, MenuItem, MenuList, MenuPopover,
  MenuTrigger, Spinner, Text
} from '@fluentui/react-components';
import {
  Add24Regular, ArrowUpload24Regular, ChevronDown20Regular,
  DocumentAdd24Regular, Search24Regular
} from '@fluentui/react-icons';
import { DepartmentPicker } from '../components/DepartmentPicker';
import { useTeamDepartments } from '../hooks/useTeamDepartments';
import { CreateSkillDialog } from './skills/CreateSkillDialog';
import { SkillDirectoryDialog } from './skills/SkillDirectoryDialog';
import { SkillsTable } from './skills/SkillsTable';
import { UploadDialog } from './skills/UploadDialog';
import { useSkills } from './skills/useSkills';
import { useSkillsStyles } from './skills/styles';

export default function Skills({ teamId }) {
  const styles = useSkillsStyles();
  const { departments, loading: departmentsLoading, error: departmentsError } = useTeamDepartments(teamId);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!selectedDepartment && departments.length > 0) {
      setSelectedDepartment(departments[0]);
    }
  }, [departments, selectedDepartment]);

  const { skills, loading, error, upload, changeStatus, deleteSkill } = useSkills(teamId, selectedDepartment);

  const showSpinner = departmentsLoading || (loading && selectedDepartment);
  const filteredSkills = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    if (!search) return skills;
    return skills.filter((skill) => {
      const name = skill.originalName || skill.fileName || '';
      const status = skill.status || '';
      const contentType = skill.contentType || '';
      return [name, status, contentType].some((value) => value.toLowerCase().includes(search));
    });
  }, [deferredQuery, skills]);

  const handleUpload = async (file) => {
    await upload(file);
    setUploadOpen(false);
    setCreateOpen(false);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.titleBlock}>
          <Text className={styles.pageTitle}>Skills</Text>
          <Text size={200}>Manage reusable skill files for the selected department.</Text>
        </div>
        <div className={styles.toolbarActions}>
          <div className={styles.toolbarControl}>
            <DepartmentPicker
              departments={departments}
              value={selectedDepartment}
              onChange={setSelectedDepartment}
            />
          </div>
          <Input
            className={styles.searchInput}
            contentBefore={<Search24Regular />}
            placeholder="Search skills..."
            value={query}
            onChange={(_, data) => setQuery(data.value)}
          />
          <Button className={styles.toolbarButton} disabled={!selectedDepartment} onClick={() => setBrowseOpen(true)}>
            Browse
          </Button>
          <Menu positioning="below-end">
            <MenuTrigger disableButtonEnhancement>
              <Button className={styles.toolbarButton} appearance="primary" icon={<Add24Regular />} iconPosition="before" disabled={!selectedDepartment}>
                Add <ChevronDown20Regular />
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<ArrowUpload24Regular />} onClick={() => setUploadOpen(true)}>
                  Upload skill
                </MenuItem>
                <MenuItem icon={<DocumentAdd24Regular />} onClick={() => setCreateOpen(true)}>
                  Create a skill
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>

      {(departmentsError || error) && (
        <Text className={styles.error}>{departmentsError || error}</Text>
      )}

      {showSpinner ? (
        <div className={styles.spinnerContainer}>
          <Spinner label="Loading skills..." />
        </div>
      ) : !selectedDepartment ? (
        <div className={styles.emptyState}>
          {departments.length === 0 ? 'No departments found for this team.' : 'Select a department to see skills.'}
        </div>
      ) : (
        <SkillsTable
          skills={filteredSkills}
          emptyMessage={skills.length === 0 ? 'No skills uploaded for this department yet.' : 'No skills match your search.'}
          onActivate={(skill) => changeStatus(skill, 'active')}
          onDeactivate={(skill) => changeStatus(skill, 'inactive')}
          onSetDraft={(skill) => changeStatus(skill, 'draft')}
          onDelete={deleteSkill}
        />
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        department={selectedDepartment}
        onUpload={handleUpload}
      />

      <CreateSkillDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        department={selectedDepartment}
        onCreate={handleUpload}
      />

      <SkillDirectoryDialog
        open={browseOpen}
        onOpenChange={setBrowseOpen}
        skills={skills}
        onSelect={(skill) => {
          if (skill.status !== 'active') changeStatus(skill, 'active');
          setBrowseOpen(false);
        }}
      />
    </div>
  );
}
