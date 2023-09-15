import React, { useState } from "react";

import { Modal, Typography, TimePicker, Space, Divider } from "antd";
import { Formik, Form , Field} from 'formik' // Import Formik form components
import * as Yup from 'yup' // import yup for validation
import dayjs from "dayjs";

import {createBonus} from "../../utils/finance-status"; // Import API base url
import { getCities } from "../../utils/city-status"; // Import API base url
//import components
import SubmitWrapper from "../forms/SubmitWrapper"
import InputWrapper from "../forms/InputWrapper"
import SelectWrapper from "../forms/SelectWrapper";
import DateRangePicker from "../DateRangePicker";

const { Text } = Typography

//initial values
const initialValues = {
    name: "",
    city_id: "",
    type: "",
    status: "",
    goal: "",
    start_time: "",
    end_time: "",
}
//validation schema
const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    city_id: Yup.number().required("Required"),
    type: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
    goal: Yup.number().required("Required"),
    // start_time: Yup.string().required("Required"),
    // end_time: Yup.string().required("Required"),
})



const CreateBounsModal = (props) => {

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

const test = {
  name: "Bonus 1",
  type: "Incentive",
  city_id: [1, 2, 3],
  start_time: "2021-01-01T00:00:00.000Z",
  end_time: "2021-01-01T00:00:00.000Z",
  goal: 100,
  payout: 10,
  };


  // date selection handler
  const [selectedDateRange, setSelectedDateRange] = useState({
    date_from: dayjs().subtract(90, "days").format("YYYY-MM-DD HH:mm:ss"),
    date_to: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  });
  const handleDateSelect = (dateRange) => {
    setSelectedDateRange({
      date_from: dayjs(dateRange[0]).format("YYYY-MM-DD HH:mm:ss"),
      date_to: dayjs(dateRange[1]).format("YYYY-MM-DD HH:mm:ss"),
    });
  };

  const [selectedTimeRange, setSelectedTimeRange] = useState({
    time_from: dayjs().subtract(90, "days").format("HH:mm"),
    time_to: dayjs().format("HH:mm"),
  });
  
  // bounce type options
  const BounceType = [
    {
      text: "Dollar",
      value: "dollar",
    },
    {
      text: "Bonus",
      values: "bonus",
    },
  ];

    return (
      <>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            const body = {
              name: values.name,
              city_id: values.city_id,
              type: values.type,
              status: values.status,
              goal: parseFloat(values.goal),
              //add time to body
              start_time: selectedDateRange.date_from,
              end_time: selectedDateRange.date_to,
            };
            // close modal after submit
            props.onCancel();
            await createBonus(body); // Call create bonus function
          }}
        >
          <Modal
            title={
              <Divider strong style={{ fontSize: "1.2rem" }}>
                {" "}
                Create New Bounce{" "}
              </Divider>
            }
            className="modalStyle"
            open={props.open}
            onCancel={props.onCancel}
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
                <InputWrapper name="name" placeholder="Bounce Name" />
                <Text type="secondary"> Cities </Text>
                <SelectWrapper
                  name="city_id"
                  placeholder="City"
                  datasource={cities}
                  mode="multiple"
                />
                <Text type="secondary">Bonus Type</Text>
                <SelectWrapper
                  name="type"
                  placeholder="Type"
                  datasource={BounceType}
                />
                <Text type="secondary">Status</Text>
                <SelectWrapper
                  name="status"
                  placeholder="Status"
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
                <InputWrapper name="goal" placeholder="Goal" />
                <Divider> Time and Date</Divider>
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
                      setSelectedTimeRange({
                        time_from: dayjs(value).format("HH:mm"),
                      });
                      console.log("time from", selectedTimeRange);
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
                      console.log("timeTo", selectedTimeRange);
                    }}
                  />
                </div>
                {/* <Text type="secondary"> wDate Range </Text> */}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <Text type="secondary">Start Date</Text>
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
                      setSelectedTimeRange({
                        time_from: dayjs(value).format("HH:mm"),
                      });
                      console.log("time from", selectedTimeRange);
                    }}
                  />
                  <Text type="secondary">End Date</Text>
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
                      console.log("timeTo", selectedTimeRange);
                    }}
                  />
                </div>
                <DateRangePicker
                  value={selectedDateRange}
                  onDateSelect={handleDateSelect}
                  unpresets={true}
                  showTime={true}
                />
              </Space>
            </Form>
          </Modal>
        </Formik>
      </>
    );
}
export default CreateBounsModal