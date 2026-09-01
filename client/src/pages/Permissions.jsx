import { useMemo, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface,
  DialogTitle, DialogTrigger, Dropdown, Input, Option, Spinner, Text
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular, Search24Regular } from '@fluentui/react-icons';
import { PermissionRow } from './permissions/PermissionRow';
import { usePermissions } from './permissions/usePermissions';
import { usePermissionsStyles } from './permissions/styles';
import {
  ALL_FILTER,
  getMemberSearchText,
  isDraftRow,
  normalizeDepartment
} from './permissions/utils';

export default function Permissions({ teamId }) {
  const styles = usePermissionsStyles();
  const {
    rows, members, loading, savingId, error, setError,
    addDraftRow, removeDraftRow,
    changeDepartment, toggleMember, toggleEnabled, deleteRow
  } = usePermissions(teamId);

  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [memberQuery, setMemberQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const departments = useMemo(() => {
    const set = new Set();
    for (const member of members) if (member.department) set.add(member.department);
    for (const row of rows) if (row.department) set.add(normalizeDepartment(row.department));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [members, rows]);

  const assignedDepartments = useMemo(() => {
    const assigned = new Set();
    for (const row of rows) {
      if (isDraftRow(row) || !row.department) continue;
      assigned.add(normalizeDepartment(row.department));
    }
    return assigned;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (isDraftRow(row)) return true;

      const department = normalizeDepartment(row.department);
      const matchesStatus = statusFilter === ALL_FILTER
        || String(Boolean(row.enabled)) === statusFilter;
      const matchesMember = !query
        || `${department} ${getMemberSearchText(row)}`.toLowerCase().includes(query);

      return matchesStatus && matchesMember;
    });
  }, [memberQuery, rows, statusFilter]);

  const hasDraftRow = rows.some(isDraftRow);
  const canAddRow = departments.some((department) => !assignedDepartments.has(department));

  const handleAdd = () => {
    if (hasDraftRow) {
      setError('Select a department for the pending row before adding another');
      return;
    }
    if (!canAddRow) {
      setError(departments.length === 0
        ? 'No departments found for this team'
        : 'All departments already have rows');
      return;
    }
    addDraftRow();
  };

  const handleDelete = (row) => {
    if (isDraftRow(row)) {
      removeDraftRow(row._id);
      return;
    }
    setPendingDelete(row);
  };

  const confirmDelete = () => {
    if (pendingDelete) deleteRow(pendingDelete._id);
    setPendingDelete(null);
  };

  if (loading) return (
    <div className={styles.panel}>
      <div className={styles.spinnerContainer}>
        <Spinner label="Loading permissions..." />
      </div>
    </div>
  );

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.titleBlock}>
          <Text weight="semibold">Department permissions</Text>
          <Text size={200}>Control access by department and selected members.</Text>
        </div>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={handleAdd}
          disabled={hasDraftRow || !canAddRow}
        >
          Add row
        </Button>
      </div>

      <div className={styles.filters}>
        <Input
          className={styles.filterControl}
          contentBefore={<Search24Regular />}
          placeholder="Search departments or members"
          value={memberQuery}
          onChange={(_, data) => setMemberQuery(data.value)}
        />
        <Dropdown
          className={styles.filterControl}
          value={statusFilter === ALL_FILTER
            ? 'All statuses'
            : statusFilter === 'true' ? 'Active' : 'Inactive'}
          selectedOptions={[statusFilter]}
          onOptionSelect={(_, data) => setStatusFilter(data.optionValue || ALL_FILTER)}
        >
          <Option value={ALL_FILTER}>All statuses</Option>
          <Option value="true">Active</Option>
          <Option value="false">Inactive</Option>
        </Dropdown>
      </div>

      {error && <Text className={styles.error}>{error}</Text>}

      <div className={styles.table} role="table" aria-label="Department permissions">
        <div className={styles.tableHeader} role="row">
          <div className={styles.headerCell} role="columnheader">Department</div>
          <div className={styles.headerCell} role="columnheader">Members</div>
          <div className={styles.headerCell} role="columnheader">Status</div>
          <div className={styles.headerCell} role="columnheader">Actions</div>
        </div>
        <div role="rowgroup">
          {filteredRows.length === 0 ? (
            <div className={styles.emptyState}>No department rows match the current filters.</div>
          ) : filteredRows.map((row) => (
            <PermissionRow
              key={row._id}
              row={row}
              members={members}
              departments={departments}
              isSaving={savingId === row._id}
              assignedDepartments={assignedDepartments}
              onDepartmentChange={changeDepartment}
              onMemberToggle={toggleMember}
              onEnabledChange={toggleEnabled}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(_, data) => !data.open && setPendingDelete(null)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete permission row?</DialogTitle>
            <DialogContent>
              This will remove the {normalizeDepartment(pendingDelete?.department).toLowerCase()} department permission row.
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" icon={<Delete24Regular />} onClick={confirmDelete}>
                Delete
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
