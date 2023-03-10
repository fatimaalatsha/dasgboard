import { Line } from '@ant-design/plots';

const ChartLine = ({ props }) => {
    return (
        <Line
        data={props}
        xField="count"
        yField="date"
        seriesField="status"
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
            colors10: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
            minBarWidth: 20,
            maxBarWidth: 20,
            // color: ['#2582a1', '#f88c24', '#c52125', '#87f4d0'],
        }}
        />
    );
}
    
export default ChartLine;