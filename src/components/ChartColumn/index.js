import { Column } from '@ant-design/plots';


const ChartColumn = ({props, xField, yField, seriesField}) => {

  const sortedData = props.sort((a, b) => b[yField] - a[yField]);

    return (
        <Column
            data={sortedData}
            xField={xField}
            yField={yField}
            seriesField={seriesField}
            isStack={true}
            label={{
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
            }}
            legend={{
              position: 'top',
              flipPage: false,
            }}
            tooltip={{
              showMarkers: false,
            }}
            meta={{
              count: {
                alias: 'Number of Leads',
              },
              city: {
                alias: 'City',
              },
              status: {
                alias: 'Status',
              },
            }}
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
              colors10: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
              minBarWidth: 250,
              maxBarWidth: 250,
              
              // color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
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