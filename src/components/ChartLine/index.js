import { Line } from "@ant-design/plots";

const ChartLine = ({ props, xField, yField, seriesField, onReady }) => {
  return (
    <Line
      data={props}
      xField={xField}
      yField={yField}
      seriesField={seriesField}
      // theme="dark"
      defaultColor="#2593fc"
      onReady={onReady}
      //   color={["#2593fc", "#f507c9", "#3f8600"]}
      smooth={true}
      tooltip={{
        showMarkers: false,
        shared: true,
      }}
      xAxis={{
        label: false,
      }}
      yAxis={{
        label: {
          autoHide: false,
          autoRotate: true,
        },
      }}
      area={{ show: true }}
      legend={{ position: "top", flipPage: false }}
      slider={{ start: 0, end: 1, trendCfg: { isArea: true } }}
      animation={{
        appear: {
          animation: "wave-in",
          duration: 3000,
        },
      }}
    />
  );
};

export default ChartLine;