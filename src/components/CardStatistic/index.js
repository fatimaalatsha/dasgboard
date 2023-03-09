import { Card, Statistic } from 'antd';

const CardStatistic = ({ title, value, color }) => {
    return(
        <Card
            style={{ width: 150, height: 100, textAlign: 'center', backgroundColor: '#f0f2f5' }}
        >
                  <Statistic
                  title={title}
                  value={value}
                  precision={0}
                  valueStyle={{ color: color }}
                  suffix=""
        />
        </Card>
    )
}

export default CardStatistic;