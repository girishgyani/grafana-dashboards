import { METRIC_CATALOGUE } from '../../../../../../panel/panel.constants';
import { COLUMN_WIDTH, FIXED_COLUMN_WIDTH } from '../../OverviewTable.constants';
import ManageColumns from '../../../ManageColumns/ManageColumns';
import { Humanize } from '../../../../../../../react-plugins-deps/components/helpers/Humanization';
import { Styling } from './MetricColumn.styles';
import { Divider } from 'antd';
import {
  Latency,
  Sparkline,
  TotalPercentage,
} from '../../../../../../../react-plugins-deps/components/Elements/Charts';
import Tooltip from 'antd/es/tooltip';
import React from 'react';
import './MetricColumns.scss';

const TimeMetric = ({ value }) => (
  <span
    className="summarize"
    style={{
      marginLeft: 'auto',
      cursor: value && value !== 'NaN' ? 'help' : '',
      color: 'rgba(255,255,255,0.8)',
    }}
  >
    {value === undefined ? `${Humanize.transform(0, 'time')}` : null}
    {value === null || value === 'NaN' ? 'N/A' : null}
    {value && value !== 'NaN' ? `${Humanize.transform(value, 'time')}` : null}
  </span>
);
const NonTimeMetric = ({ value, units }) => (
  <span
    className="summarize"
    style={{
      marginLeft: 'auto',
      cursor: value && value !== 'NaN' ? 'help' : '',
      color: 'rgba(255,255,255,0.8)',
    }}
  >
    {value === undefined ? `0 ${units}` : null}
    {value === null || value === 'NaN' ? 'N/A' : null}
    {value && value !== 'NaN' ? `${Humanize.transform(value, 'number')} ${units}` : null}
  </span>
);

const getSorting = (orderBy, metricName) => {
  if (orderBy === metricName) {
    return 'ascend';
  } else if (orderBy === `-${metricName}`) {
    return 'descend';
  }

  return false;
};

export const getOverviewColumn = (metricName, columnIndex, totalValues, orderBy) => {
  const metric = METRIC_CATALOGUE[metricName];
  const isTimeMetric = metricName.endsWith('_time');

  return {
    sorter: true,
    key: metricName,
    sortOrder: getSorting(orderBy, metricName),
    sortDirections: ['descend', 'ascend'],
    width: columnIndex === 0 ? COLUMN_WIDTH * 1.8 : FIXED_COLUMN_WIDTH,
    title: () => <ManageColumns placeholder={metricName} currentMetric={metric} width="100%" />,
    render: (text, item, index) => {
      const stats = item.metrics[metricName].stats;
      const statPerSec = stats.qps || stats.sum_per_sec;
      // @ts-ignore
      const tooltipData = [
        {
          header: isTimeMetric ? 'Per query' : 'Per sec',
          value: isTimeMetric
            ? Humanize.transform(stats.avg, 'time')
            : Humanize.transform(statPerSec, 'number'),
          key: 'qps',
        },
        {
          header: 'Sum',
          value: stats.sum && Humanize.transform(stats.sum, metric.pipeTypes.sumPipe),
          key: 'sum',
        },
        {
          header: 'From total',
          value:
            ((stats.sum_per_sec / totalValues.metrics[metricName].stats.sum_per_sec) * 100).toFixed(2) + ' %',
          key: 'from-total',
        },
      ].filter(tooltip => tooltip.value);

      const latencyTooltipData = [
        { header: '⌜ Min', value: stats.min },
        { header: '⌟ Max', value: stats.max },
        { header: '◦ Avg', value: stats.avg },
        { header: '• 99%', value: stats.p99 },
      ]
        .filter(element => element.value)
        .map(({ header, value }) => ({ header: header, value: Humanize.transform(value) }));

      // @ts-ignore
      const polygonChartProps = {
        data: item.sparkline,
        metricName: metricName,
        color: index === 0 ? 'rgba(223, 159, 85, 0.8)' : undefined,
      };
      const MetricsList = ({ data }) => {
        return (
          <div className={Styling.metricsWrapper} data-qa="metrics-list">
            {data.map((item, index, list) => {
              return (
                // eslint-disable-next-line react/jsx-key
                <div className={Styling.singleMetricWrapper} data-qa={item.key || ''}>
                  <span className={Styling.metricName}>{`${item.header} : ${item.value}`}</span>
                  {list.length === index + 1 ? null : <Divider className={Styling.metricsListDivider} />}
                </div>
              );
            })}
          </div>
        );
      };

      const MetricTooltip = () => {
        return (
          <div>
            <div className={Styling.tooltipHeader}>{metric.humanizeName}</div>
            <Divider style={{ background: '#363434', margin: '0' }} />
            <MetricsList data={tooltipData} />
            {latencyTooltipData.length ? (
              <>
                <Divider style={{ background: '#666666', margin: '0' }} />
                {metricName === 'query_time' && (
                  <Latency {...{ data: stats }} className="latency-chart-container" />
                )}
                <MetricsList data={latencyTooltipData} />
              </>
            ) : null}
          </div>
        );
      };
      return (
        <div className="overview-content-column">
          <div style={{ marginRight: 'auto' }}>
            {columnIndex === 0 && <Sparkline {...polygonChartProps} />}
          </div>
          <Tooltip
            getPopupContainer={() => document.querySelector('#antd') || document.body}
            placement="left"
            overlayClassName="overview-column-tooltip"
            title={
              (stats.avg && stats.avg !== 'NaN') || (statPerSec && statPerSec !== 'NaN') ? (
                <MetricTooltip />
              ) : null
            }
          >
            {isTimeMetric ? <TimeMetric value={stats.avg} /> : null}
            {!isTimeMetric ? <NonTimeMetric value={statPerSec} units={metric.units} /> : null}
            <TotalPercentage
              width={((stats.sum_per_sec / totalValues.metrics[metricName].stats.sum_per_sec) * 100).toFixed(
                2
              )}
            />
          </Tooltip>
        </div>
      );
    },
  };
};
