import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme) => ({
  actionPanel: css`
    display: flex;
    justify-content: flex-end;
    margin-bottom: ${theme.spacing.sm};
  `,
  actionsColumn: css`
    display: flex;
    justify-content: center;
  `,
  tableWrapper: css`
    padding: ${theme.spacing.md};
  `,
  settingsLink: css`
    color: ${theme.colors.linkExternal};
    &:hover {
      color: ${theme.colors.linkExternal};
    }
  `,
  actionButton: css`
    margin-left: 10px;
  `,
});
