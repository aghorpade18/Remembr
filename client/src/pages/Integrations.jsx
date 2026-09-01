import { useEffect, useState } from 'react';
import { Spinner, Text } from '@fluentui/react-components';
import { DepartmentPicker } from '../components/DepartmentPicker';
import { useTeamDepartments } from '../hooks/useTeamDepartments';
import { IntegrationCard } from './integrations/IntegrationCard';
import { useIntegrations } from './integrations/useIntegrations';
import { useIntegrationsStyles } from './integrations/styles';

export default function Integrations({ teamId }) {
    const styles = useIntegrationsStyles();
    const { departments, loading: departmentsLoading, error: departmentsError } = useTeamDepartments(teamId);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    useEffect(() => {
        if (!selectedDepartment && departments.length > 0) {
            setSelectedDepartment(departments[0]);
        }
    }, [departments, selectedDepartment]);

    const { integrations, loading, savingId, error, updateIntegration } = useIntegrations(teamId, selectedDepartment);

    const showSpinner = departmentsLoading || (loading && selectedDepartment);

    return (
        <div className={styles.panel}>
            <div className={styles.toolbar}>
                <div className={styles.titleBlock}>
                    <Text weight="semibold">Integrations</Text>
                    <Text size={200}>Configure credentials and settings per department.</Text>
                </div>
                <div className={styles.toolbarActions}>
                    <DepartmentPicker
                        departments={departments}
                        value={selectedDepartment}
                        onChange={setSelectedDepartment}
                    />
                </div>
            </div>

            {(departmentsError || error) && (
                <Text className={styles.error}>{departmentsError || error}</Text>
            )}

            {showSpinner ? (
                <Spinner label="Loading integrations..." />
            ) : !selectedDepartment ? (
                <div className={styles.emptyState}>
                    {departments.length === 0 ? 'No departments found for this team.' : 'Select a department to configure integrations.'}
                </div>
            ) : (
                <div className={styles.grid}>
                    {integrations.map((integration) => (
                        <IntegrationCard
                            key={integration._id}
                            integration={integration}
                            saving={savingId === integration._id}
                            onToggle={(enabled) => updateIntegration(integration, { enabled })}
                            onSave={(updates) => updateIntegration(integration, updates)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
