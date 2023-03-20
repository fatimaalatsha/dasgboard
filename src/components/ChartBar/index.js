import { Bar } from '@ant-design/plots';

const ChartBar = ({props, xField, yField, seriesField}) => {

    return (
        <Bar
          data={props}
          xField={xField}
          yField={yField}
          seriesField={seriesField}
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

          isStack={true}

          label={{
            position: 'middle',
            content: (item) => {
              return item.count;

  // const percent = ((item.count / item.data.total) * 100).toFixed(2);
  //   return `${percent}%`;
            },
            style: {
              fill: '#fff',

            },
            formatter: ({ value }) => {
              console.log(value);
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
              autoHide: true,
              autoRotate: false,
            },
          }}
          yAxis={{
            label: {
              autoHide: true,
              autoRotate: false,
            },
          }}
          responsive={true}
          padding="auto"
          forceFit={true}
          theme={{
            // colors10: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
            minBarWidth: 20,
            maxBarWidth: 20,
            color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
            
          }}

        />)
}

export default ChartBar;