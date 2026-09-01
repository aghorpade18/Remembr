import { useEffect, useState } from 'react';
import { Button, Spinner, Text } from '@fluentui/react-components';
import { ArrowUpload24Regular } from '@fluentui/react-icons';
import { DepartmentPicker } from '../components/DepartmentPicker';
import { useTeamDepartments } from '../hooks/useTeamDepartments';
import { SkillsTable } from './skills/SkillsTable';
import { UploadDialog } from './skills/UploadDialog';
import { useSkills } from './skills/useSkills';
import { useSkillsStyles } from './skills/styles';

export default function Skills({ teamId }) {
  const styles = useSkillsStyles();
  const { departments, loading: departmentsLoading, error: departmentsError } = useTeamDepartments(teamId);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    if (!selectedDepartment && departments.length > 0) {
      setSelectedDepartment(departments[0]);
    }
  }, [departments, selectedDepartment]);

  const { skills, loading, error, upload, changeStatus, deleteSkill } = useSkills(teamId, selectedDepartment);

  const showSpinner = departmentsLoading || (loading && selectedDepartment);

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.titleBlock}>
          <Text weight="semibold">Skills</Text>
          <Text size={200}>Upload JSON skill files scoped to a department. Only one skill can be active per department.</Text>
        </div>
        <div className={styles.toolbarActions}>
          <DepartmentPicker
            departments={departments}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
          />
          <Button
            appearance="primary"
            icon={<ArrowUpload24Regular />}
            disabled={!selectedDepartment}
            onClick={() => setUploadOpen(true)}
          >
            Upload skill
          </Button>
        </div>
      </div>

      {(departmentsError || error) && (
        <Text className={styles.error}>{departmentsError || error}</Text>
      )}

      {showSpinner ? (
        <Spinner label="Loading skills..." />
      ) : !selectedDepartment ? (
        <div className={styles.emptyState}>
          {departments.length === 0 ? 'No departments found for this team.' : 'Select a department to see skills.'}
        </div>
      ) : (
        <SkillsTable
          skills={skills}
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
        onUpload={async (file) => {
          await upload(file);
          setUploadOpen(false);
        }}
      />
    </div>
  );
}
