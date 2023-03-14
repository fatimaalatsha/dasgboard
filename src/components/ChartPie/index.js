import { Pie } from '@ant-design/plots';


const ChartPie = ({props, count , city}) => {

    return (
        <Pie
              appendPadding= {10}
              data={props}
              angleField="count"
              colorField="city"
              radius={0.8}
              label={{
                type: 'spider',
               labelHeight: 28,
                content: (item) => {
                  return `${item.city}: ${item.count}`;
                },
                style: {
                  textAlign: 'center',
                  fontSize: 12,
                },
                  }}
                legend={{
                position: 'bottom',
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
              responsive={true}
              interactions={[{ type: 'element-selected' }, { type: 'element-active' }]}
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
};

export default ChartPie;