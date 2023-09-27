import React, { useState } from "react"; // import react hooks
import {
  Button,
  Divider,
  Modal,
  Space,
  Typography,
  TimePicker,
  message,
  Input,
} from "antd";
import { Formik, Form } from "formik"; // Import Formik form components
import * as Yup from "yup"; // import yup for validation
import dayjs from "dayjs";
import useFetch from "../../hooks/use-new-fetch";

import { editBonus } from "../../utils/finance-status"; // Import API base url
import { getCities } from "../../utils/city-status"; // Import API base url
//import components
import SubmitWrapper from "../../components/forms/SubmitWrapper";
import InputWrapper from "../../components/forms/InputWrapper";
import SelectWrapper from "../../components/forms/SelectWrapper";
import DateRangePicker from "../../components/DateRangePicker";

//validation schema
const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  city_id: Yup.number().required("Required"),
  type: Yup.string().required("Required"),
  status: Yup.string().required("Required"),
  goal: Yup.number().required("Required"),
  payout: Yup.number().required("Required"),
  // start_time: Yup.string().required("Required"),
  // end_time: Yup.string().required("Required"),
});

const { Text } = Typography;
const BounceDetails = ({ bounceId, open, onCancel }) => {
  const [bonus, setBonus] = useState([]); // Set bonus state

  const { data, loading, error, refetch } = useFetch(`/v1/bonuses/${bounceId}`); // Fetch data from API if bounceId is not null

  const [cities, setCities] = useState([]); // Set cities state

  // Get cities
  const fetchCities = async () => {
    const cities = await getCities();
    setCities(cities);
  };

  // Fetch cities on component mount
  React.useEffect(() => {
    fetchCities();
  }, []);

  // date selection handler
  const [selectedDateRange, setSelectedDateRange] = useState({
    date_from: dayjs().subtract(90, "days").format("YYYY-MM-DD"),
    date_to: dayjs().format("YYYY-MM-DD"),
  });
  const handleDateSelect = (dateRange) => {
    setSelectedDateRange({
      date_from: dayjs(dateRange[0]).format("YYYY-MM-DD"),
      date_to: dayjs(dateRange[1]).format("YYYY-MM-DD"),
    });
  };

  const [selectedTimeRange, setSelectedTimeRange] = useState({
    time_to: dayjs().format("HH:mm"),
  });

  const [selectedTimeRange1, setSelectedTimeRange1] = useState({
    time_from: dayjs().format("HH:mm"),
  });
  // bounce type options
  const BounceType = [
    {
      text: "Money",
      value: "money",
    },
    {
      text: "Rides",
      value: "rides",
    },
  ];
  if (loading) return <p>Loading...</p>;
  if (error) return <p></p>;

  return (
    <>
      <Formik
        initialValues={{
          name: data.name,
          city_id: data.city_id,
          type: data.type,
          status: data.status,
          goal: data.goal,
          start_time: data.start_time,
          end_time: data.end_time,
          payout: data.payout,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, actions) => {
          const body = {
            name: values.name,
            city_id: values.city_id,
            type: values.type,
            status: values.status,
            goal: parseFloat(values.goal),
            payout: parseFloat(values.payout),
            //add time to body
            start_time:
              selectedDateRange.date_from + " " + selectedTimeRange1.time_from,
            end_time:
              selectedDateRange.date_to + " " + selectedTimeRange.time_to,
          };
          await editBonus(bounceId, body).then((response) => {
            if (response) {
              actions.resetForm();
              message.success("Bonus Updated successfully");
              refetch();
              onCancel();
            } else {
              message.error("Error updating bonus");
            }
          });
        }}
      >
        {(props) => (
          <Modal
            title={
              <Divider strong style={{ fontSize: "1.2rem" }}>
                {" "}
                Update Bounce{" "}
              </Divider>
            }
            className="modalStyle"
            open={open}
            onCancel={onCancel}
            destroyOnClose={true}
            footer={[
              <SubmitWrapper key="submit" type="primary">
                Submit
              </SubmitWrapper>,
            ]}
          >
            <Form>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="secondary">Bonus Title</Text>
                <InputWrapper name="name" />
                <Text type="secondary"> Cities </Text>
                <SelectWrapper
                  name="city_id"
                  datasource={cities}
                  mode="multiple"
                />
                <Text type="secondary">Bonus Type</Text>
                <SelectWrapper name="type" datasource={BounceType} />
                <Text type="secondary">Status</Text>
                <SelectWrapper
                  name="status"
                  datasource={[
                    {
                      text: "Active",
                      value: "active",
                    },
                    {
                      text: "Inactive",
                      value: "inactive",
                    },
                  ]}
                />
                <Text type="secondary">Goal</Text>
                <InputWrapper name="goal" defaultValue={bonus.goal} />
                <Text type="secondary">Payout</Text>
                <InputWrapper name="payout" defaultValue={bonus.payout} />
                <Divider> Date</Divider>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <Text type="secondary"> Date Range </Text>
                  <DateRangePicker
                    value={selectedDateRange}
                    onDateSelect={handleDateSelect}
                    unpresets={true}
                    showTime={true}
                  />
                </div>
                <Divider> Time </Divider>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <Text type="secondary">Start Time</Text>
                  <TimePicker
                    name="start_time"
                    showNow
                    format="HH:mm"
                    hideDisabledOptions
                    disabledTime={(current) => {
                      return {
                        disabledMinutes: () => {
                          const minuteSteps = [0, 15, 30, 45, 59];
                          const minutes = [];
                          for (let i = 0; i < 60; i++) {
                            if (!minuteSteps.includes(i)) {
                              minutes.push(i);
                            }
                          }
                          return minutes;
                        },
                      };
                    }}
                    onSelect={(value) => {
                      setSelectedTimeRange1({
                        time_from: dayjs(value).format("HH:mm"),
                      });
                    }}
                  />
                  <Text type="secondary">End Time</Text>
                  <TimePicker
                    name="end_time"
                    showNow={false}
                    format="HH:mm"
                    hideDisabledOptions
                    disabledTime={(current) => {
                      return {
                        disabledMinutes: () => {
                          const minuteSteps = [0, 15, 30, 45, 59];
                          const minutes = [];
                          for (let i = 0; i < 60; i++) {
                            if (!minuteSteps.includes(i)) {
                              minutes.push(i);
                            }
                          }
                          return minutes;
                        },
                      };
                    }}
                    onSelect={(value) => {
                      setSelectedTimeRange({
                        time_to: dayjs(value).format("HH:mm"),
                      });
                    }}
                  />
                </div>
              </Space>
            </Form>
          </Modal>
        )}
      </Formik>
    </>
  );
};

export default BounceDetails;
