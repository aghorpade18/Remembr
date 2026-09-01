import { memo, useEffect, useState } from 'react';
import {
    Button, Card, CardHeader, Field, Input, Switch, Text
} from '@fluentui/react-components';
import {
    Globe24Regular, Bug24Regular, BookOpen24Regular, Wrench24Regular,
    BranchFork24Regular, ShareAndroid24Regular
} from '@fluentui/react-icons';
import { useIntegrationsStyles } from './styles';

const TOOL_ICONS = {
    wiki: <BookOpen24Regular />,
    jira: <Bug24Regular />,
    confluence: <Globe24Regular />,
    servicenow: <Wrench24Regular />,
    github: <BranchFork24Regular />,
    sharepoint: <ShareAndroid24Regular />
};

function toolLabel(tool) {
    return tool.charAt(0).toUpperCase() + tool.slice(1);
}

function IntegrationCardBase({ integration, saving, onToggle, onSave }) {
    const styles = useIntegrationsStyles();
    const [config, setConfig] = useState(integration.config || {});
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setConfig(integration.config || {});
        setDirty(false);
    }, [integration.config, integration._id]);

    const update = (field, value) => {
        setConfig((current) => ({ ...current, [field]: value }));
        setDirty(true);
    };

    const save = async () => {
        await onSave({ config });
        setDirty(false);
    };

    return (
        <Card className={styles.card}>
            <CardHeader
                image={TOOL_ICONS[integration.tool]}
                header={<Text weight="semibold" size={400}>{toolLabel(integration.tool)}</Text>}
                description={<Text size={200}>Scoped to {integration.department}</Text>}
                action={
                    <Switch
                        checked={integration.enabled}
                        disabled={saving}
                        onChange={(_, data) => onToggle(data.checked)}
                        label={integration.enabled ? 'On' : 'Off'}
                    />
                }
            />
            {integration.enabled && (
                <div className={styles.fields}>
                    <Field label="Base URL">
                        <Input
                            value={config.baseUrl || ''}
                            onChange={(_, data) => update('baseUrl', data.value)}
                            placeholder="https://..."
                            disabled={saving}
                        />
                    </Field>
                    <Field label="API Key">
                        <Input
                            type="password"
                            value={config.apiKey || ''}
                            onChange={(_, data) => update('apiKey', data.value)}
                            disabled={saving}
                        />
                    </Field>
                    <Field label="Project Key">
                        <Input
                            value={config.projectKey || ''}
                            onChange={(_, data) => update('projectKey', data.value)}
                            disabled={saving}
                        />
                    </Field>
                    <div className={styles.cardActions}>
                        <Button appearance="primary" onClick={save} disabled={saving || !dirty}>
                            {saving ? 'Saving…' : 'Save config'}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}

export const IntegrationCard = memo(IntegrationCardBase);
