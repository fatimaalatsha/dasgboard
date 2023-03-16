import { Card, Statistic, Popover, Typography } from 'antd';

const { Text } = Typography;

const CardStatistic = ({ title, value, color, popInfo }) => {
    return (
        <Popover
            content={
                <Text style={{ color: color }}>
                   {popInfo}
                </Text>

            }
        >
        <Card
            style={{ width: 145, height: 100, textAlign: 'center', backgroundColor: '#f0f2f5' }}
        >
                  <Statistic
                  title={title}
                  value={value}
                  precision={0}
                  valueStyle={{ color: color }}
                  suffix=""
        />
            </Card>
        </Popover>
    )
}

export default CardStatistic;