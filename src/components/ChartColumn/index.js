import { Column } from '@ant-design/plots';


const ChartColumn = (
  { props,
    xField,
    yField,
    seriesField,
    isGroup = false,
    isStack = true,
    meta = {
      count: {
        alias: 'Number of Leads',
                },
                city: {
                  alias: 'City',
                },
                status: {
                  alias: 'Status',
                },
    },
    label={
                position: 'middle',
                content: (item) => {
                  return item.count;
                },
                style: {
                  fill: '#fff',
                },
                formatter: ({ value }) => {
                  return value.toFixed(2);
                },
              },
  }) => {

  const sortedData = props.sort((a, b) => b[yField] - a[yField]);

  return (
    <Column
            data={sortedData}
            xField={xField}
            yField={yField}
            seriesField={seriesField}
            isStack={isStack}
            isGroup={isGroup}
            label={label}            
            legend={{
              position: 'top',
              flipPage: false,
            }}
            tooltip={{
              showMarkers: false,
            }}
            meta={meta}
            xAxis={{
              label: {
                autoHide: false,
                autoRotate: true,
              },
            }}
            yAxis={{
              label: {
                autoHide: false,
                autoRotate: true,
              },
            }}
            responsive={true}
            padding="fixed"
            forceFit={true}
            theme={{
              minBarWidth: 250,
              maxBarWidth: 250,
                }}

            conversionTag={{
              offsetX: 10,
              offsetY: -10,
              style: {
                fill: 'white',
                fontSize: 12,
                fontWeight: 500,
                textBaseline: 'middle',
              },
        }}
              
        />
    );
};

export default ChartColumn;