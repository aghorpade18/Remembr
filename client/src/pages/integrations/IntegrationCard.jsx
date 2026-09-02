import { memo, useEffect, useState } from 'react';
import {
    Button, Card, CardHeader, Dialog, DialogActions, DialogBody, DialogContent,
    DialogSurface, DialogTitle, Field, Input, Switch, Text
} from '@fluentui/react-components';
import {
    Dismiss24Regular, Globe24Regular, Settings24Regular
} from '@fluentui/react-icons';
import { useIntegrationsStyles } from './styles';

const LOGO_BASE_URL = 'https://cdn.simpleicons.org';
const OFFICE_LOGO_BASE_URL = 'https://res.cdn.office.net/files/fabric-cdn-prod_20221201.001/assets/brand-icons/product/svg';

const TOOL_LOGOS = {
    jira: `${LOGO_BASE_URL}/jira/0052CC`,
    confluence: `${LOGO_BASE_URL}/confluence/172B4D`,
    github: `${LOGO_BASE_URL}/github/181717`,
    sharepoint: `${OFFICE_LOGO_BASE_URL}/sharepoint_48x1.svg`,
    teams: `${OFFICE_LOGO_BASE_URL}/teams_48x1.svg`,
    teamscalendar: `${OFFICE_LOGO_BASE_URL}/teams_48x1.svg`,
    outlook: `${OFFICE_LOGO_BASE_URL}/outlook_48x1.svg`,
    powerpoint: `${OFFICE_LOGO_BASE_URL}/powerpoint_48x1.svg`,
    blackduck: 'https://www.blackduck.com/favicon.ico',
    veracode: 'https://www.veracode.com/favicon.ico',
    polaris: 'https://www.synopsys.com/favicon.ico',
    workday: 'https://www.workday.com/favicon.ico',
    bitbucket: `${LOGO_BASE_URL}/bitbucket/0052CC`
};

const TOOL_LABELS = {
    jira: 'Jira',
    confluence: 'Wiki',
    github: 'GitHub',
    sharepoint: 'SharePoint',
    teams: 'Teams',
    teamscalendar: 'Teams Calendar',
    outlook: 'Outlook',
    powerpoint: 'MS PowerPoint',
    blackduck: 'Black Duck',
    veracode: 'Veracode',
    polaris: 'Polaris',
    workday: 'Workday',
    bitbucket: 'Bitbucket'
};

const TOOL_CONNECT_URLS = {
    jira: 'https://id.atlassian.com/login',
    confluence: 'https://id.atlassian.com/login',
    github: 'https://github.com/login',
    sharepoint: 'https://login.microsoftonline.com/',
    teams: 'https://teams.microsoft.com/',
    teamscalendar: 'https://outlook.office.com/calendar/',
    outlook: 'https://outlook.office.com/mail/',
    powerpoint: 'https://www.office.com/launch/powerpoint',
    blackduck: 'https://www.blackduck.com/login.html',
    veracode: 'https://login.veracode.com/',
    polaris: 'https://polaris.synopsys.com/',
    workday: 'https://www.myworkday.com/',
    bitbucket: 'https://bitbucket.org/account/signin/'
};

const TOOL_ICONS = {
    jira: <FlatLogo tool="jira" />,
    confluence: <FlatLogo tool="confluence" />,
    github: <FlatLogo tool="github" />,
    sharepoint: <FlatLogo tool="sharepoint" />,
    teams: <FlatLogo tool="teams" />,
    teamscalendar: <FlatLogo tool="teamscalendar" />,
    outlook: <FlatLogo tool="outlook" />,
    powerpoint: <FlatLogo tool="powerpoint" />,
    blackduck: <FlatLogo tool="blackduck" />,
    veracode: <FlatLogo tool="veracode" />,
    polaris: <FlatLogo tool="polaris" />,
    workday: <FlatLogo tool="workday" />,
    bitbucket: <FlatLogo tool="bitbucket" />
};

function FlatLogo({ tool }) {
    const styles = useIntegrationsStyles();
    const [failed, setFailed] = useState(false);
    const source = TOOL_LOGOS[tool];

    if (!source || failed) return <Globe24Regular />;

    return (
        <span className={styles.logoFrame}>
            <img
                className={styles.logoImage}
                src={source}
                alt=""
                aria-hidden="true"
                onError={() => setFailed(true)}
            />
        </span>
    );
}

function toolLabel(tool) {
    return TOOL_LABELS[tool] || tool.charAt(0).toUpperCase() + tool.slice(1);
}

function getConnectUrl(url, integration) {
    try {
        const connectUrl = new URL(url);
        connectUrl.searchParams.set('source', 'remembr-admin');
        connectUrl.searchParams.set('integration', integration.tool);
        connectUrl.searchParams.set('teamId', integration.teamId);
        connectUrl.searchParams.set('department', integration.department);
        connectUrl.searchParams.set('redirectFrom', window.location.origin);
        return connectUrl.toString();
    } catch {
        return url;
    }
}

function IntegrationCardBase({ integration, saving, onToggle, onSave }) {
    const styles = useIntegrationsStyles();
    const [config, setConfig] = useState(integration.config || {});
    const [dirty, setDirty] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);

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
        setConfigOpen(false);
    };

    const toggle = (_, data) => {
        onToggle(data.checked);
        if (!data.checked) setConfigOpen(false);
    };

    const connect = () => {
        const url = config.baseUrl || TOOL_CONNECT_URLS[integration.tool];
        if (!url) return;
        window.open(getConnectUrl(url, integration), '_blank', 'noopener,noreferrer');
    };

    return (
        <Card className={styles.card}>
            <CardHeader
                image={TOOL_ICONS[integration.tool]}
                header={<Text weight="semibold" size={400}>{toolLabel(integration.tool)}</Text>}
                action={
                    <div className={styles.headerActions}>
                        {integration.enabled && (
                            <Button
                                size="small"
                                icon={<Settings24Regular />}
                                aria-label={`Configure ${toolLabel(integration.tool)}`}
                                onClick={() => setConfigOpen(true)}
                            />
                        )}
                        <Switch
                            checked={integration.enabled}
                            disabled={saving}
                            onChange={toggle}
                            label={integration.enabled ? 'On' : 'Off'}
                        />
                    </div>
                }
            />
            <Dialog open={configOpen && integration.enabled} onOpenChange={(_, data) => setConfigOpen(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle
                            action={
                                <Button
                                    appearance="subtle"
                                    icon={<Dismiss24Regular />}
                                    aria-label="Cancel configuration"
                                    onClick={() => setConfigOpen(false)}
                                />
                            }
                        >
                            {toolLabel(integration.tool)} configuration
                        </DialogTitle>
                        <DialogContent>
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
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={connect} disabled={saving || !(config.baseUrl || TOOL_CONNECT_URLS[integration.tool])}>
                                Connect
                            </Button>
                            <Button appearance="primary" onClick={save} disabled={saving || !dirty}>
                                {saving ? 'Saving…' : 'Save config'}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </Card>
    );
}

export const IntegrationCard = memo(IntegrationCardBase);
